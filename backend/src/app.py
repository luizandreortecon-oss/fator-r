from pgdas_parser import processar_documento_geral
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import jwt
import bcrypt
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# ========== AUXILIAR DE CONEXÃO AO POSTGRESQL (AIVEN) ==========
def get_pg_conn():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise ValueError("A variável DATABASE_URL não está configurada.")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return psycopg2.connect(database_url)

# ========== INICIALIZAÇÃO DO BANCO NO POSTGRESQL ==========
def init_pg_db():
    try:
        conn = get_pg_conn()
        cur = conn.cursor()
        
        # Tabela de Usuários
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Tabela de Histórico de Documentos
        cur.execute("""
            CREATE TABLE IF NOT EXISTS historico_documentos (
                id SERIAL PRIMARY KEY,
                empresa_id VARCHAR(50) DEFAULT '1',
                tipo_documento VARCHAR(50) NOT NULL,
                periodo_apuracao VARCHAR(20) NOT NULL,
                faturamento_mes NUMERIC(15, 2) DEFAULT 0.00,
                massa_salarial_mes NUMERIC(15, 2) DEFAULT 0.00,
                cpp_patronal_mes NUMERIC(15, 2) DEFAULT 0.00,
                fator_r NUMERIC(6, 4) DEFAULT 0.0000,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Atualiza a tabela existente adicionando a coluna user_id se ela não existir
        cur.execute("""
            ALTER TABLE historico_documentos 
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Tabelas no Aiven (PostgreSQL) verificadas/atualizadas com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar/atualizar tabelas no PostgreSQL: {e}")

# Executa a inicialização na partida
init_pg_db()

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

def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(" ")[1]
    JWT_SECRET = os.getenv('JWT_SECRET', 'chave-secreta-temporaria')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload.get('user_id')
    except Exception:
        return None

# ========== ROTAS PÚBLICAS ==========
@app.route('/api/teste', methods=['GET'])
def teste():
    return jsonify({
        'mensagem': '✅ Backend está funcionando!',
        'status': 'online'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'})

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
        
        conn = get_pg_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name)
            VALUES (%s, %s, %s)
            RETURNING id
        ''', (email, password_hash, full_name))
        
        user_id = cursor.fetchone()['id']
        conn.commit()
        cursor.close()
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
        
        conn = get_pg_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT id, email, password_hash, full_name FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
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

# ========== ROTA DE UPLOAD DE ARQUIVOS ==========
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'sucesso': False, 'erro': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    modo = request.form.get('modo', 'carga_inicial')
    tipo_esperado = request.form.get('tipo_esperado', 'auto')

    if file.filename == '':
        return jsonify({'sucesso': False, 'erro': 'Nenhum arquivo selecionado'}), 400

    try:
        pdf_bytes = file.read()
        dados = processar_documento_geral(pdf_bytes, tipo_esperado=tipo_esperado)
        
        user_id = get_current_user_id()

        faturamento = dados.get('faturamentoTotal') or dados.get('faturamentoMes') or 0.0
        massa_salarial = (dados.get('massaSalarialTotal') or dados.get('massaSalarialMes') or 0.0) + (dados.get('cppPatronalMes') or 0.0)
        cpp_patronal = dados.get('cppPatronalMes') or 0.0
        fator_r = dados.get('fatorR') or 0.0
        tipo_doc = dados.get('tipo_documento') or 'desconhecido'
        periodo = dados.get('periodo_apuracao') or 'N/A'

        # Salva o resultado diretamente no PostgreSQL (Aiven)
        conn = get_pg_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO historico_documentos 
            (user_id, empresa_id, tipo_documento, periodo_apuracao, faturamento_mes, massa_salarial_mes, cpp_patronal_mes, fator_r)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            '1',
            tipo_doc,
            periodo,
            faturamento,
            massa_salarial,
            cpp_patronal,
            fator_r
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'sucesso': True,
            'tipo_documento': tipo_doc,
            'faturamento': faturamento,
            'massa_salarial': massa_salarial,
            'fator_r': fator_r,
            'enquadrado': dados.get('enquadrado', False),
            'anexo': dados.get('anexo', ''),
            'periodo_apuracao': periodo,
            'detalhes_mensais': dados.get('detalhesMensais', []),
            'modo': modo
        }), 200

    except ValueError as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 400
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': f'Erro no processamento: {str(e)}'}), 500

# ========== ROTA DE BUSCA DO HISTÓRICO ==========
@app.route('/api/historico', methods=['GET'])
def obter_historico():
    try:
        user_id = get_current_user_id()
        
        conn = get_pg_conn()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if user_id:
            cursor.execute("""
                SELECT id, tipo_documento, periodo_apuracao, faturamento_mes, 
                       massa_salarial_mes, cpp_patronal_mes, fator_r, criado_em 
                FROM historico_documentos 
                WHERE user_id = %s 
                ORDER BY criado_em DESC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT id, tipo_documento, periodo_apuracao, faturamento_mes, 
                       massa_salarial_mes, cpp_patronal_mes, fator_r, criado_em 
                FROM historico_documentos 
                ORDER BY criado_em DESC
            """)
            
        registros = cursor.fetchall()
        cursor.close()
        conn.close()

        historico = []
        for reg in registros:
            historico.append({
                'id': reg['id'],
                'tipo_documento': reg['tipo_documento'],
                'periodo_apuracao': reg['periodo_apuracao'],
                'faturamento': float(reg['faturamento_mes']),
                'massa_salarial': float(reg['massa_salarial_mes']),
                'cpp_patronal': float(reg['cpp_patronal_mes']),
                'fator_r': float(reg['fator_r']),
                'criado_em': reg['criado_em'].strftime('%Y-%m-%d %H:%M:%S') if reg['criado_em'] else ''
            })

        return jsonify({'sucesso': True, 'historico': historico})
        
    except Exception as e:
        return jsonify({'sucesso': False, 'erro': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
