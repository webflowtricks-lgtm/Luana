import { Camera, Plus, User, ShieldAlert } from "lucide-react";
import Logo from "./Logo";

interface HeaderProps {
  onNewAlbumClick: () => void;
  currentRole: "photographer" | "client";
  onChangeRole: (role: "photographer" | "client") => void;
  onGoHome: () => void;
  isPhotographerAuthenticated?: boolean;
}

export default function Header({
  onNewAlbumClick,
  currentRole,
  onChangeRole,
  onGoHome,
  isPhotographerAuthenticated,
}: HeaderProps) {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 border-b border-zinc-900/80 bg-black/90 backdrop-blur-xl shadow-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div
          id="brand-container"
          className="flex cursor-pointer items-center transition-opacity hover:opacity-95"
          onClick={onGoHome}
        >
          <Logo className="h-16" />
        </div>

        {/* Actions & Role Badge */}
        <div id="header-actions" className="flex items-center gap-3">
          {currentRole === "photographer" && isPhotographerAuthenticated !== false && (
            <div
              id="role-badge-container"
              className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 px-4 py-1.5 text-xs font-bold text-[#DFBA6B] shadow-sm"
            >
              Galerias
            </div>
          )}

          {/* New Album Button */}
          {currentRole === "photographer" && isPhotographerAuthenticated !== false && (
            <button
              id="btn-new-album-header"
              onClick={onNewAlbumClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-[#DFBA6B]/10 transition-transform hover:scale-[1.02] hover:opacity-95 focus:outline-none active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Novo álbum</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
