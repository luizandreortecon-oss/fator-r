"use client"

import { useState } from "react"
import { Calculator, LogIn, X, Lock } from "lucide-react"

// Importação com caminho relativo para não dar erro de alias na Vercel
import { API_URL } from "../lib/api"

export function DashboardHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
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

      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      alert(isRegister ? "Conta criada com sucesso!" : "Login efetuado com sucesso!")
      setIsModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Erro na requisição:", error)
      alert("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Calculator className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-balance text-xl font-bold tracking-tight text-white sm:text-2xl">
                Análise do Fator R & Diagnóstico Tributário
              </h1>
              <p className="mt-0.5 text-pretty text-sm text-slate-400">
                Monitore o enquadramento do Simples Nacional (Anexo III vs Anexo V)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 shadow-sm cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar / Cadastrar</span>
            </button>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl text-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                {isRegister ? "Criar Conta" : "Acessar Conta"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Carregando..." : isRegister ? "Cadastrar" : "Entrar"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-500">
              {isRegister ? (
                <p>
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Fazer Login
                  </button>
                </p>
              ) : (
                <p>
                  Ainda não tem conta?{" "}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="font-semibold text-blue-600 hover:underline"
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
