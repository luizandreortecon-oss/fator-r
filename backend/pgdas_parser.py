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
    elif "DOCUMENTO DE ARRECADAÇÃO" in texto_upper or "DAS" in texto_upper or "PGDAS-D/DEFIS" in texto_upper:
        return "das"
    else:
        return "desconhecido"


def extrair_dados_pgdas(texto_completo: str) -> dict:
    """Extrai RBT12, FS12 e histórico do PDF do PGDAS-D"""
    pa_match = re.search(r"Período de Apuração\s*\(PA\):\s*(\d{2}/\d{4})", texto_completo, re.IGNORECASE)
    periodo_apuracao = pa_match.group(1) if pa_match else "Desconhecido"

    rbt12_match = re.search(
        r"Receita bruta acumulada nos doze meses anteriores ao PA\.\s*\(RBT12\)\s*[\n\r]*\s*([\d\.,]+)",
        texto_completo,
        re.IGNORECASE
    )
    rbt12 = parse_brl_float(rbt12_match.group(1)) if rbt12_match else 0.0

    rpa_match = re.search(
        r"Receita Bruta do PA\s*\(RPA\)[^\n]*\n\s*([\d\.,]+)",
        texto_completo,
        re.IGNORECASE
    )
    rpa = parse_brl_float(rpa_match.group(1)) if rpa_match else 0.0

    fs12 = 0.0
    secao_folha = re.search(r"2\.3\)\s*Folha de Salários Anteriores.*?(?=2\.4|\n\s*3\))", texto_completo, re.DOTALL | re.IGNORECASE)
    if secao_folha:
        texto_folha = secao_folha.group(0)
        entradas_folha = re.findall(r"(\d{2}/\d{4})\.?\s*([\d\.,]+)", texto_folha)
        if entradas_folha:
            fs12 = sum(parse_brl_float(v) for _, v in entradas_folha)

    detalhes_mensais = []
    secao_receitas = re.search(r"2\.2\)\s*Receitas Brutas Anteriores.*?(?=2\.3|2\.4)", texto_completo, re.DOTALL | re.IGNORECASE)
    if secao_receitas:
        texto_receitas = secao_receitas.group(0)
        entradas_receitas = re.findall(r"(\d{2}/\d{4})\.?\s*([\d\.,]+)", texto_receitas)
        for mes, val_str in entradas_receitas:
            detalhes_mensais.append({
                "mes": mes,
                "faturamento": parse_brl_float(val_str)
            })

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
        "detalhesMensais": detalhes_mensais
    }


def extrair_dados_folha(texto_completo: str) -> dict:
    """Extrai os valores da Folha de Pagamento / Pró-Labore do mês"""
    # Regex para capturar Total da Folha ou Pró-Labore
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
    """Extrai faturamento/valor apurado da Guia DAS"""
    match_faturamento = re.search(r"(?:Receita Bruta|Valor do Débito|Total Apurado)[^\n\r]*?([\d\.,]{4,})", texto_completo, re.IGNORECASE)
    fat_mes = parse_brl_float(match_faturamento.group(1)) if match_faturamento else 0.0

    match_pa = re.search(r"(\d{2}/\d{4})", texto_completo)
    periodo = match_pa.group(1) if match_pa else "Atual"

    return {
        "tipo_documento": "Guia DAS",
        "periodo_apuracao": periodo,
        "faturamentoMes": round(fat_mes, 2)
    }


def processar_documento_geral(pdf_bytes: bytes) -> dict:
    """Função principal que classifica e extrai os dados do PDF enviado"""
    texto_completo = ""

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            texto_pagina = page.extract_text()
            if texto_pagina:
                texto_completo += texto_pagina + "\n"

    if not texto_completo.strip():
        raise ValueError("Não foi possível ler o texto do PDF. O arquivo pode ser uma imagem escaneada.")

    # 1. Identifica o tipo do documento
    tipo = identificar_tipo_documento(texto_completo)

    # 2. Redireciona para o extrator adequado
    if tipo == "pgdas":
        return extrair_dados_pgdas(texto_completo)
    elif tipo == "folha":
        return extrair_dados_folha(texto_completo)
    elif tipo == "das":
        return extrair_dados_das(texto_completo)
    else:
        raise ValueError("Tipo de documento não reconhecido. Envie um PGDAS, Folha de Pagamento ou Guia DAS.")
