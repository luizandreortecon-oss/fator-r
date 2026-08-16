from pgdas_parser import processar_documento_geral
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import jwt
import bcrypt
import sqlite3
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# ========== BANCO DE DADOS ==========
DB_PATH = os.path.join(os.path.dirname(__file__), '../database.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ========== FUNÇÕES DE AUTENTICAÇÃO ==========
def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_token(user_id, email):
    JWT_SECRET = os.getenv('JWT_SECRET', 'chave-secreta-temporaria')
    JWT_EXPIRES_IN = 7
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRES_IN)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# ========== ROTAS PÚBLICAS ==========
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

# ========== ROTA DE UPLOAD (ATUALIZADA) ==========
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'sucesso': False, 'erro': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    modo = request.form.get('modo', 'carga_inicial')
    tipo_esperado = request.form.get('tipo_esperado', 'auto') # Captura o botão do Next.js

    if file.filename == '':
        return jsonify({'sucesso': False, 'erro': 'Nenhum arquivo selecionado'}), 400

    try:
        pdf_bytes = file.read()
        
        # Envia o arquivo e o tipo selecionado para validação no pgdas_parser
        dados = processar_documento_geral(pdf_bytes, tipo_esperado=tipo_esperado)

        return jsonify({
            'sucesso': True,
            'tipo_documento': dados.get('tipo_documento'),
            'faturamento': dados.get('faturamentoTotal') or dados.get('faturamentoMes') or 0,
            'massa_salarial': dados.get('massaSalarialTotal') or dados.get('massaSalarialMes') or 0,
            'fator_r': dados.get('fatorR', 0),
            'enquadrado': dados.get('enquadrado', False),
            'anexo': dados.get('anexo', ''),
            'periodo_apuracao': dados.get('periodo_apuracao', ''),
            'detalhes_mensais': dados.get('detalhesMensais', []),
            'modo': modo
        }), 200

    except ValueError as e:
        # Captura mensagens de validação (ex: arquivo diferente do botão selecionado)
        return jsonify({'sucesso': False, 'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro no processamento: {str(e)}'}), 500

# ========== ROTAS DE AUTENTICAÇÃO ==========
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        dados = request.get_json(force=True)
        
        if not dados:
            return jsonify({'erro': 'Nenhum dado enviado'}), 400
        
        email = dados.get('email')
        password = dados.get('password')
        full_name = dados.get('fullName')
        
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
        dados = request.get_json(force=True)
        
        if not dados:
            return jsonify({'erro': 'Nenhum dado enviado'}), 400
        
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
        
        if not user or not check_password(password, user['password_hash']):
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
