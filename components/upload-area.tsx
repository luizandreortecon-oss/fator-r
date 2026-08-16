'use client'

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, RefreshCw, FileSpreadsheet } from "lucide-react"

interface UploadAreaProps {
  onDataExtracted?: (data: {
    tipoUpload: 'carga_inicial' | 'atualizacao_mensal'
    faturamento: number
    massaSalarial: number
    fatorR?: number
    anexo?: string
    enquadrado?: boolean
    detalhesMensais?: Array<{ mes: string; faturamento: number; massaSalarial: number }>
  }) => void
}

export function UploadArea({ onDataExtracted }: UploadAreaProps) {
  const [modo, setModo] = useState<'carga_inicial' | 'atualizacao_mensal'>('carga_inicial')
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = ".pdf,.csv,.xml,.xlsx,.xls"

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    setStatus(null)
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase()
    
    if (!acceptedTypes.includes(extension)) {
      setStatus({
        type: 'error',
        message: 'Formato inválido. Envie arquivos PDF, CSV, XML ou Excel.',
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus({
        type: 'error',
        message: 'O arquivo excede o limite máximo de 10MB.',
      })
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setStatus(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("modo", modo) // Envia se é 'carga_inicial' ou 'atualizacao_mensal'

      const API_URL = "https://fator-r.onrender.com/api/upload"

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || data.message || "Erro ao processar o arquivo")
      }

      setStatus({
        type: 'success',
        message: modo === 'carga_inicial'
          ? `Extrato PGDAS importado! 12 meses carregados com sucesso.`
          : `Mês atual processado! O 13º mês antigo foi descartado automaticamente.`,
      })

      if (onDataExtracted) {
        onDataExtracted({
          tipoUpload: modo,
          faturamento: data.faturamento ?? data.faturamentoTotal ?? 0,
          massaSalarial: data.massa_salarial ?? data.massaSalarialTotal ?? 0,
          fatorR: data.fator_r,
          anexo: data.anexo,
          enquadrado: data.enquadrado,
          detalhesMensais: data.detalhes_mensais,
        })
      }

    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || "Erro na comunicação com o servidor ao enviar arquivo.",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setStatus(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-card-foreground">Upload de Documentos</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de importação para atualizar a janela dos últimos 12 meses.
        </p>
      </div>

      {/* Seletor de Modo */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => { setModo('carga_inicial'); removeFile(); }}
          className={`flex items-center justify-center gap-1.5 rounded-md py-2 transition ${
            modo === 'carga_inicial'
              ? 'bg-card text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Primeiro Acesso (12 Meses)</span>
        </button>

        <button
          type="button"
          onClick={() => { setModo('atualizacao_mensal'); removeFile(); }}
          className={`flex items-center justify-center gap-1.5 rounded-md py-2 transition ${
            modo === 'atualizacao_mensal'
              ? 'bg-card text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Mensal (Guia + Folha)</span>
        </button>
      </div>

      {/* Input de arquivo invisível */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
      />

      {/* Dropzone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {modo === 'carga_inicial'
              ? "Envie o Extrato PGDAS-D ou Declaração dos 12 meses"
              : "Envie a Guia do Simples (DAS) ou Folha do mês atual"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {modo === 'carga_inicial'
              ? "Extrai o histórico completo de faturamento e folha acumulados"
              : "Adiciona o mês atual e descarta automaticamente o 13º mês mais antigo"}
          </p>
        </div>
      ) : (
        /* Card do arquivo selecionado */
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>

            {!uploading && (
              <button
                onClick={removeFile}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                title="Remover arquivo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando documento...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>
                  {modo === 'carga_inicial'
                    ? "Importar Histórico (12m)"
                    : "Atualizar Mês e Recalcular"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mensagens de Feedback */}
      {status && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-md p-3 text-xs font-medium ${
            status.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  )
}
