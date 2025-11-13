import Logo from "@/assets/logo.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Logo pequena */}
        <div className="flex items-center gap-2">
          <img
            src={Logo}
            alt="Poderosa Beleza"
            className="h-5 w-auto opacity-90"
            loading="lazy"
          />
        </div>

        {/* Centro: direitos + site */}
        <p className="text-[11px] sm:text-xs text-gray-400 text-center">
          © {year} <span className="text-gray-300">Poderosa Beleza</span> — Todos os direitos
          reservados.{" "}
          <a
            href="https://www.poderosabeleza.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
          >
            poderosabeleza.com.br
          </a>
        </p>

        {/* Direita: crédito */}
        <p className="text-[11px] sm:text-xs text-gray-500">
          Desenvolvido por <span className="text-pink-400">Ramos developer</span>
        </p>
      </div>
    </footer>
  );
}
