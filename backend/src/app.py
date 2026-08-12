from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/teste', methods=['GET'])
def teste():
    return jsonify({
        'mensagem': '✅ Backend está funcionando!',
        'status': 'online'
    })

@app.route('/api/calcular', methods=['POST'])
def calcular():
    try:
        dados = request.json
        
        if not dados or 'faturamento' not in dados or 'massa_salarial' not in dados:
            return jsonify({'erro': 'Faturamento e massa salarial são obrigatórios'}), 400
        
        faturamento = float(dados['faturamento'])
        massa_salarial = float(dados['massa_salarial'])
        
        if faturamento <= 0:
            return jsonify({'erro': 'Faturamento deve ser maior que zero'}), 400
        
        fator_r = (massa_salarial / faturamento) * 100
        meta = 28.0
        anexo = 'III' if fator_r >= meta else 'V'
        enquadrado = fator_r >= meta
        
        ajuste = 0
        if not enquadrado:
            meta_massa = (meta / 100) * faturamento
            ajuste = meta_massa - massa_salarial
        
        return jsonify({
            'fator_r': round(fator_r, 2),
            'anexo': anexo,
            'enquadrado': enquadrado,
            'meta': meta,
            'ajuste_necessario': round(ajuste, 2),
            'faturamento': round(faturamento, 2),
            'massa_salarial': round(massa_salarial, 2)
        })
        
    except ValueError:
        return jsonify({'erro': 'Valores inválidos. Use números.'}), 400
    except Exception as e:
        return jsonify({'erro': f'Erro interno: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
