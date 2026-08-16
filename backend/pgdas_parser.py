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

def extrair_dados_pgdas(pdf_bytes: bytes) -> dict:
    """Lê o PDF do PGDAS-D e extrai RBT12, FS12 e o histórico mensal"""
    texto_completo = ""

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            texto_pagina = page.extract_text()
            if texto_pagina:
                texto_completo += texto_pagina + "\n"

    if not texto_completo.strip():
        raise ValueError("Não foi possível ler o texto do PDF. O arquivo pode ser uma imagem escaneada.")

    # 1. Período de Apuração (PA)
    pa_match = re.search(r"Período de Apuração\s*\(PA\):\s*(\d{2}/\d{4})", texto_completo, re.IGNORECASE)
    periodo_apuracao = pa_match.group(1) if pa_match else "Desconhecido"

    # 2. Receita Bruta Acumulada (RBT12)
    rbt12_match = re.search(
        r"Receita bruta acumulada nos doze meses anteriores ao PA\.\s*\(RBT12\)\s*[\n\r]*\s*([\d\.,]+)",
        texto_completo,
        re.IGNORECASE
    )
    rbt12 = parse_brl_float(rbt12_match.group(1)) if rbt12_match else 0.0

    # 3. Receita Bruta do Mês (RPA)
    rpa_match = re.search(
        r"Receita Bruta do PA\s*\(RPA\)[^\n]*\n\s*([\d\.,]+)",
        texto_completo,
        re.IGNORECASE
    )
    rpa = parse_brl_float(rpa_match.group(1)) if rpa_match else 0.0

    # 4. Folha de Salários Acumulada (FS12)
    fs12 = 0.0
    secao_folha = re.search(r"2\.3\)\s*Folha de Salários Anteriores.*?(?=2\.4|\n\s*3\))", texto_completo, re.DOTALL | re.IGNORECASE)
    
    if secao_folha:
        texto_folha = secao_folha.group(0)
        entradas_folha = re.findall(r"(\d{2}/\d{4})\.?\s*([\d\.,]+)", texto_folha)
        if entradas_folha:
            fs12 = sum(parse_brl_float(v) for _, v in entradas_folha)

    # 5. Histórico Mensal de Faturamento
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

    # 6. Cálculo do Fator R
    fator_r = (fs12 / rbt12) if rbt12 > 0 else 0.0
    enquadrado = fator_r >= 0.28
    anexo = "Anexo III" if enquadrado else "Anexo V"

    return {
        "sucesso": True,
        "periodo_apuracao": periodo_apuracao,
        "faturamentoTotal": round(rbt12, 2),
        "massaSalarialTotal": round(fs12, 2),
        "faturamentoMesAtual": round(rpa, 2),
        "fatorR": round(fator_r, 4),
        "enquadrado": enquadrado,
        "anexo": anexo,
        "detalhesMensais": detalhes_mensais
    }
