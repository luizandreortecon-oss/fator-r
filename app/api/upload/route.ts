import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export async function POST(request: NextRequest) {
  try {
    // 🔥 1. PEGA O TOKEN DO HEADER DA REQUISIÇÃO
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { erro: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // 🔥 2. COPIA O FORMDATA PARA PODER REENVIAR
    const formData = await request.formData();
    
    // 🔥 3. CRIA UM NOVO FORMDATA PARA O BACKEND (porque o original já foi consumido)
    const backendFormData = new FormData();
    
    // Copia todos os campos do FormData original
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        backendFormData.append(key, value, value.name);
      } else {
        backendFormData.append(key, value as string);
      }
    }

    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // =========================================================
    // 1. FAZ UPLOAD DO ARQUIVO PARA O GOOGLE DRIVE
    // =========================================================
    let driveLink = null;
    let driveFileId = null;

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const stream = Readable.from(buffer);

      const driveResponse = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
        },
        media: {
          mimeType: file.type || 'application/pdf',
          body: stream,
        },
        fields: 'id, name, webViewLink',
      });

      driveFileId = driveResponse.data.id;
      driveLink = driveResponse.data.webViewLink;
    } catch (driveErr) {
      console.error('Aviso: Não foi possível salvar no Google Drive:', driveErr);
      // Continua a execução para tentar extrair os dados via Python mesmo se o Drive falhar
    }

    // =========================================================
    // 2. ENVIA O ARQUIVO PARA O PYTHON NO RENDER (EXTRAI DADOS)
    // =========================================================
    const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/upload`
      : 'https://fator-r.onrender.com/api/upload';

    const pythonResponse = await fetch(PYTHON_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // 🔥 AQUI ESTÁ A CORREÇÃO!
      },
      body: backendFormData, // Usa o novo FormData criado
    });

    const parsedData = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return NextResponse.json(
        { 
          sucesso: false, 
          erro: parsedData.erro || 'Erro ao ler os dados do PDF no Python',
          driveLink 
        },
        { status: pythonResponse.status }
      );
    }

    // =========================================================
    // 3. DEVOLVE TUDO AO FRONTEND (DADOS EXTRAÍDOS + LINKS DO DRIVE)
    // =========================================================
    return NextResponse.json({
      ...parsedData,
      driveFileId,
      driveLink,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Erro no servidor ao processar upload:', error);
    return NextResponse.json(
      { error: 'Falha geral ao realizar o upload', details: error.message },
      { status: 500 }
    );
  }
}
