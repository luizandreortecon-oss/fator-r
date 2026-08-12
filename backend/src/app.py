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
    dados = request.json
    faturamento = float(dados['faturamento'])
    massa_salarial = float(dados['massa_salarial'])
    
    fator_r = (massa_salarial / faturamento) * 100
    anexo = 'III' if fator_r >= 28 else 'V'
    
    return jsonify({
        'fator_r': round(fator_r, 2),
        'anexo': anexo,
        'enquadrado': fator_r >= 28
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
