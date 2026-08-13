"use client"

import { useState } from "react"
import { Calculator, LogIn, UserPlus, X, Lock } from "lucide-react"
import { API_URL } from "@/lib/api"

export function DashboardHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false) // Alterna entre Login e Cadastro
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const endpoint = isRegister ? `${API_URL}/auth/register` : `${API_URL}/auth/login`
    const bodyPayload = isRegister ? { email, password, fullName } : { email, password }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.erro || "Ocorreu um erro na autenticação.")
        setLoading(false)
        return
      }

      // Salva o token retornado pelo backend Python
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      alert(isRegister ? "Conta criada com sucesso!" : "Login efetuado com sucesso!")
      setIsModalOpen(false)
      // Recarrega para atualizar estados se necessário
      window.location.reload()
    } catch (error) {
      console.error("Erro na requisição:", error)
      alert("Erro ao conectar com o servidor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          {/* Título e Ícone */}
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

          {/* Botão de Abrir o Login */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar / Cadastrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* MODAL DE LOGIN / CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            {/* Fechar Modal */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-card-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">
                {isRegister ? "Criar Conta" : "Acessar Conta"}
              </h2>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Carregando..." : isRegister ? "Cadastrar" : "Entrar"}
              </button>
            </form>

            {/* Alternar entre Login e Cadastro */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isRegister ? (
                <p>
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              ) : (
                <p>
                  Ainda não tem conta?{" "}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="font-medium text-primary hover:underline"
                  >
                    Cadastrar-se
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
