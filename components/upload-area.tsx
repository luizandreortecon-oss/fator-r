"use client"

import { useRef, useState, useCallback } from "react"
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Receipt,
  Landmark,
  Loader2,
  CheckCircle2,
} from "lucide-react"

type DocStatus = "uploading" | "processing" | "done"

type UploadedDoc = {
  id: string
  name: string
  status: DocStatus
}

const acceptedDocs = [
  { icon: FileText, label: "PGDAS-D" },
  { icon: FileSpreadsheet, label: "Folha de Pagamento" },
  { icon: Landmark, label: "Guia FGTS / eSocial" },
  { icon: Receipt, label: "NFe / NFS-e" },
]

export function UploadArea() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [docs, setDocs] = useState<UploadedDoc[]>([])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const novos: UploadedDoc[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      status: "uploading" as DocStatus,
    }))
    setDocs((prev) => [...novos, ...prev].slice(0, 6))

    // Simula o pipeline de processamento da IA.
    novos.forEach((doc) => {
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "processing" } : d)),
        )
      }, 900)
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "done" } : d)),
        )
      }, 2600)
    })
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-card-foreground">Envio de Documentos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Nossa IA lê seus arquivos e calcula o Fator R automaticamente.
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-label="Área de upload de arquivos. Arraste ou clique para selecionar."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-primary bg-accent" : "border-border bg-muted/40 hover:bg-muted"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-card-foreground">
          Arraste e solte seus arquivos aqui
        </p>
        <p className="text-xs text-muted-foreground">ou clique para selecionar — PDF ou XML</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.xml,application/pdf,text/xml,application/xml"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Tipos aceitos */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {acceptedDocs.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Fila de processamento */}
      {docs.length > 0 && (
        <ul className="mt-4 space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate text-xs font-medium text-foreground">{doc.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                {doc.status === "done" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                    <span className="text-success">Processado</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                    <span className="text-muted-foreground">
                      {doc.status === "uploading" ? "Enviando..." : "IA analisando..."}
                    </span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
