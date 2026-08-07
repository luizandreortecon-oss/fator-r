import { Calculator } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Calculator className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-balance text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
              Análise do Fator R & Diagnóstico Tributário
            </h1>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              Monitore o enquadramento do Simples Nacional (Anexo III vs Anexo V)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
          <span className="text-xs font-medium text-muted-foreground">
            Dados atualizados · Jul/2025
          </span>
        </div>
      </div>
    </header>
  )
}
