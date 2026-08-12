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

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        dados = request.json
        email = dados.get('email')
        password = dados.get('password')
        full_name = dados.get('full_name')
        
        if not email or not password or not full_name:
            return jsonify({'erro': 'Email, senha e nome são obrigatórios'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        existing = cursor.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name)
            VALUES (?, ?, ?)
        ''', (email, password_hash, full_name))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        token = generate_token(user_id, email)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'full_name': full_name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao registrar: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        dados = request.json
        email = dados.get('email')
        password = dados.get('password')
        
        if not email or not password:
            return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        user = cursor.execute(
            'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'erro': 'Email ou senha inválidos'}), 401
        
        if not check_password(password, user['password_hash']):
            return jsonify({'erro': 'Email ou senha inválidos'}), 401
        
        token = generate_token(user['id'], user['email'])
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name']
            }
        })
        
    except Exception as e:
        return jsonify({'erro': f'Erro ao fazer login: {str(e)}'}), 500
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
