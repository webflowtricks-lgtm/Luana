import React, { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "./Logo";

interface PhotographerAuthProps {
  onAuthenticate: () => void;
}

export default function PhotographerAuth({ onAuthenticate }: PhotographerAuthProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "senh@") {
      setError(null);
      onAuthenticate();
    } else {
      setError("Senha incorreta. Por favor, tente novamente.");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-900 bg-[#0d0d0d] p-8 shadow-2xl">
        {/* Subtle Decorative Background Gold Glows */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#DFBA6B]/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C29C47]/5 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          {/* Brand Logo inside the login card */}
          <Logo className="h-20 mb-6" />

          <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-serif">
            Área Restrita
          </h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs">
            Acesso exclusivo ao gerenciador de galerias privadas. Insira sua chave de acesso.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
            <div className="relative rounded-2xl border border-zinc-850 bg-zinc-950 px-4 py-3 focus-within:border-[#DFBA6B] focus-within:ring-1 focus-within:ring-[#DFBA6B]/20">
              <label htmlFor="photographer-password" className="block text-[10px] font-bold uppercase tracking-wider text-[#DFBA6B] text-left">
                Senha de Acesso
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  id="photographer-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Insira a senha do fotógrafo"
                  className="w-full bg-transparent text-sm font-semibold tracking-wide text-zinc-100 placeholder-zinc-700 focus:outline-none"
                  autoFocus
                />
                <button
                  id="btn-toggle-password-visibility"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-zinc-500 hover:text-[#DFBA6B] focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-400 text-left pl-1 animate-shake">
                {error}
              </p>
            )}

            <button
              id="btn-submit-photographer-auth"
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-gradient py-3.5 text-sm font-bold text-black shadow-lg shadow-[#DFBA6B]/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Acessar Painel
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
