import re
import pdfplumber
import io

def parse_brl_float(valor_str: str) -> float:
    """Converte valores BRL ("1.840.769,27") para float (1840769.27)"""
    if not valor_str or valor_str.strip().lower() in ["nenhuma", "não se aplica", "-"]:
        return 0.0
    try:
        limpo = valor_str.strip().replace(".", "").replace(",", ".")
        return float(limpo)
    except ValueError:
        return 0.0


def identificar_tipo_documento(texto: str) -> str:
    """Identifica o tipo de documento com base em palavras-chave"""
    texto_upper = texto.upper()
    
    if "PGDAS-D" in texto_upper or "DECLARAÇÃO DO SIMPLES NACIONAL" in texto_upper or "RECEITA BRUTA ACUMULADA" in texto_upper:
        return "pgdas"
    elif "FOLHA DE PAGAMENTO" in texto_upper or "PRÓ-LABORE" in texto_upper or "PRO-LABORE" in texto_upper or "RESUMO DA FOLHA" in texto_upper:
        return "folha"
    elif "FGTS" in texto_upper or "ESOCIAL" in texto_upper or "GFIP" in texto_upper or "SEFIP" in texto_upper:
        return "fgts"
    elif "NOTA FISCAL" in texto_upper or "NFS-E" in texto_upper or "DANFE" in texto_upper or "NF-E" in texto_upper:
        return "nfe"
    elif "DOCUMENTO DE ARRECADAÇÃO" in texto_upper or "DAS" in texto_upper or "PGDAS-D/DEFIS" in texto_upper:
        return "das"
    else:
        return "desconhecido"


def extrair_dados_pgdas(texto_completo: str) -> dict:
    """Extrai RBT12, FS12 e histórico do PDF do PGDAS-D / Extrato"""
    pa_match = re.search(r"Período de Apuração\s*\(PA\):\s*(\d{2}/\d{4})", texto_completo, re.IGNORECASE)
    periodo_apuracao = pa_match.group(1) if pa_match else "Desconhecido"

    # Busca Receita Bruta do Mês Atual (RPA)
    match_rpa = re.search(r"Receita Bruta do PA \(RPA\)[^\d]+([\d\.,]+)", texto_completo, re.IGNORECASE)
    rpa = float(match_rpa.group(1).replace('.', '').replace(',', '.')) if match_rpa else 0.0

    # 1. Busca RBT12 (Faturamento acumulado de 12m)
    padroes_rbt12 = [
        r"RBT12[\s\n:]*R?\$?\s*([\d\.,]+)",
        r"Receita\s+bruta\s+acumulada\s+nos\s+doze\s+meses\s+anteriores[^\d]+([\d\.,]+)"
    ]
    rbt12 = 0.0
    for p in padroes_rbt12:
        match = re.search(p, texto_completo, re.IGNORECASE)
        if match:
            rbt12 = float(match.group(1).replace('.', '').replace(',', '.'))
            break

    # 2. Busca FS12 (Folha de Pagamento acumulada de 12m)
    padroes_fs12 = [
        r"Total\s+de\s+Folhas\s+de\s+Sal[aá]rios\s+Anteriores[^\d]+([\d\.,]+)",
        r"Massa\s+Salarial\s+Acumulada[^\d]+([\d\.,]+)"
    ]
    fs12 = 0.0
    for p in padroes_fs12:
        match = re.search(p, texto_completo, re.IGNORECASE)
        if match:
            fs12 = float(match.group(1).replace('.', '').replace(',', '.'))
            break

    # 3. Cálculo do Fator R e Enquadramento
    fator_r = (fs12 / rbt12) if rbt12 > 0 else 0.0
    enquadrado = fator_r >= 0.28

    return {
        "tipo_documento": "PGDAS-D",
        "periodo_apuracao": periodo_apuracao,
        "faturamentoTotal": round(rbt12, 2),
        "massaSalarialTotal": round(fs12, 2),
        "faturamentoMesAtual": round(rpa, 2),
        "fatorR": round(fator_r, 4),
        "enquadrado": enquadrado,
        "anexo": "Anexo III" if enquadrado else "Anexo V",
        "detalhesMensais": []
    }


def extrair_dados_folha(texto_completo: str) -> dict:
    """Extrai os valores da Folha de Pagamento / Pró-Labore do mês"""
    match_folha = re.search(r"(?:TOTAL|LIQUIDO|BRUTO|PRO-LABORE|PRÓ-LABORE)[^\n\r]*?([\d\.,]{4,})", texto_completo, re.IGNORECASE)
    massa_mes = parse_brl_float(match_folha.group(1)) if match_folha else 0.0

    match_pa = re.search(r"(\d{2}/\d{4})", texto_completo)
    periodo = match_pa.group(1) if match_pa else "Atual"

    return {
        "tipo_documento": "Folha de Pagamento",
        "periodo_apuracao": periodo,
        "massaSalarialMes": round(massa_mes, 2)
    }


def extrair_dados_das(texto_completo: str) -> dict:
    """Extrai faturamento e a CPP (INSS Patronal) destacados no DAS"""
    match_faturamento = re.search(
        r"(?:Receita Bruta|Valor do Débito|Total Apurado)[^\n\r]*?([\d\.,]{4,})", 
        texto_completo, 
        re.IGNORECASE
    )
    fat_mes = parse_brl_float(match_faturamento.group(1)) if match_faturamento else 0.0

    match_cpp = re.search(
        r"(?:CPP|Contribuição Patronal Previdenciária)[^\n\r]*?([\d\.,]{4,})", 
        texto_completo, 
        re.IGNORECASE
    )
    cpp_mes = parse_brl_float(match_cpp.group(1)) if match_cpp else 0.0

    match_pa = re.search(r"(\d{2}/\d{4})", texto_completo)
    periodo = match_pa.group(1) if match_pa else "Atual"

    return {
        "tipo_documento": "Guia DAS / FGTS",
        "periodo_apuracao": periodo,
        "faturamentoMes": round(fat_mes, 2),
        "cppPatronalMes": round(cpp_mes, 2)
    }


def processar_documento_geral(pdf_bytes: bytes, tipo_esperado: str = "auto") -> dict:
    """
    Função principal que classifica, valida e extrai os dados do PDF enviado.
    """
    texto_completo = ""

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            texto_pagina = page.extract_text()
            if texto_pagina:
                texto_completo += texto_pagina + "\n"

    if not texto_completo.strip():
        raise ValueError("Não foi possível ler o texto do PDF. O arquivo pode ser uma imagem escaneada.")

    tipo_detectado = identificar_tipo_documento(texto_completo)

    nomes_amigaveis = {
        "pgdas": "PGDAS-D",
        "folha": "Folha de Pagamento",
        "fgts": "Guia FGTS / eSocial",
        "nfe": "Nota Fiscal (NFe/NFS-e)",
        "das": "Guia DAS",
        "desconhecido": "Documento Não Reconhecido"
    }

    tipo_esperado_clean = (tipo_esperado or "auto").lower().strip()
    
    if tipo_esperado_clean != "auto":
        is_compativel = (
            tipo_detectado == tipo_esperado_clean or
            (tipo_esperado_clean in ["fgts", "das"] and tipo_detectado in ["fgts", "das"])
        )

        if not is_compativel:
            nome_esperado = nomes_amigaveis.get(tipo_esperado_clean, tipo_esperado_clean.upper())
            nome_detectado = nomes_amigaveis.get(tipo_detectado, "Desconhecido")
            raise ValueError(
                f"Documento incorreto! Você selecionou o botão '{nome_esperado}', "
                f"mas o arquivo enviado parece ser '{nome_detectado}'."
            )

    if tipo_detectado == "pgdas":
        return extrair_dados_pgdas(texto_completo)
    elif tipo_detectado == "folha":
        return extrair_dados_folha(texto_completo)
    elif tipo_detectado in ["das", "fgts"]:
        return extrair_dados_das(texto_completo)
    elif tipo_detectado == "nfe":
        return {
            "tipo_documento": "NFe / NFS-e",
            "faturamentoMes": 0.0
        }
    else:
        raise ValueError("Tipo de documento não reconhecido. Envie um PGDAS, Folha de Pagamento, Guia DAS/FGTS ou NFe.")
