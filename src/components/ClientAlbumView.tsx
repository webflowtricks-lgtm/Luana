import React, { useState, useEffect } from "react";
import { Album, Photo } from "../types";
import {
  Lock,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Camera,
  Check,
  Eye,
  LogOut
} from "lucide-react";

interface ClientAlbumViewProps {
  album: Album;
  onBack: () => void;
  onUpdateAlbum: (updatedAlbum: Album) => void;
  onUnlockAlbum: (id: string) => void;
}

const getNumericSize = (sizeStr: string): number => {
  if (sizeStr === "sm") return 64;
  if (sizeStr === "md") return 112;
  if (sizeStr === "lg") return 176;
  const parsed = parseInt(sizeStr, 10);
  return isNaN(parsed) ? 112 : parsed;
};

export default function ClientAlbumView({
  album,
  onBack,
  onUpdateAlbum,
  onUnlockAlbum,
}: ClientAlbumViewProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Custom local cache verification logic (stays unlocked once password is correct)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!album.password) return true;
    const savedTimestamp = localStorage.getItem(`lumiere_unlocked_at_${album.id}`);
    return !!savedTimestamp;
  });

  const [galleryTimeLeft, setGalleryTimeLeft] = useState<string>("");
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  // Selected photo for Zoom/Lightbox
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Anti-screenshot & image protection states
  const [isBlurred, setIsBlurred] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger a temporary protective toast warning
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    // Auto-clear after 3.5 seconds
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  };

  // Prevent right-click, dragging, and keyboard screenshot/save shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleBlur = () => {
      // When window loses focus (e.g., taking screenshots or opening clipping tool), overlay gets activated immediately
      setIsBlurred(true);
    };

    const handleFocus = () => {
      // Small delay on returning focus to prevent immediate flashing back if clipping tool lingers
      setTimeout(() => {
        setIsBlurred(false);
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setTimeout(() => {
          setIsBlurred(false);
        }, 300);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept PrintScreen
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setIsBlurred(true);
        triggerToast("Capturas de tela são proibidas para proteger os direitos autorais da fotógrafa.");
        try {
          navigator.clipboard.writeText("Esta galeria é protegida por direitos autorais — Luana Santos Fotografia");
        } catch (err) {}
        setTimeout(() => {
          setIsBlurred(false);
        }, 2000);
      }

      // Intercept Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        triggerToast("O download direto de fotos foi desativado para segurança do álbum.");
      }

      // Intercept Ctrl+P / Cmd+P (Print Page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        triggerToast("A impressão direta destas fotos foi desativada.");
      }

      // Intercept Ctrl+C / Cmd+C (Copy Image/Text)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        e.preventDefault();
        triggerToast("A cópia de imagens e conteúdos foi desativada neste álbum.");
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  // Simple unlock check from localStorage
  useEffect(() => {
    if (!album.password) {
      setIsUnlocked(true);
      return;
    }
    const savedTimestamp = localStorage.getItem(`lumiere_unlocked_at_${album.id}`);
    setIsUnlocked(!!savedTimestamp);
  }, [album.id, album.password]);

  // Gallery lifetime expiration countdown since the creation date (5 days)
  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdDate = new Date(album.createdAt);
      const expiryDate = new Date(createdDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days lifetime
      const diffMs = expiryDate.getTime() - Date.now();

      if (diffMs <= 0) {
        setGalleryTimeLeft("Expirada");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (mins > 0) parts.push(`${mins}m`);
      parts.push(`${secs}s`);

      setGalleryTimeLeft(parts.join(" "));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [album.createdAt]);

  // Handle unlock submit
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === album.password) {
      setIsUnlocked(true);
      setErrorMsg("");
      // Save unlock timestamp in local cache
      localStorage.setItem(`lumiere_unlocked_at_${album.id}`, Date.now().toString());
      onUnlockAlbum(album.id);
    } else {
      setErrorMsg("Senha incorreta. Por favor, tente novamente.");
      const el = document.getElementById("client-password-form");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  const handleManualLock = () => {
    localStorage.removeItem(`lumiere_unlocked_at_${album.id}`);
    setIsUnlocked(false);
    setPasswordInput("");
  };

  // Toggle favorite / heart status
  const handleToggleHeart = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPhotos = album.photos.map((photo) => {
      if (photo.id === photoId) {
        return { ...photo, approved: !photo.approved }; // true means favorited
      }
      return photo;
    });
    onUpdateAlbum({ ...album, photos: updatedPhotos });
  };

  const filteredPhotos = activeTab === "all" 
    ? album.photos 
    : album.photos.filter((p) => p.approved);

  const favoritesCount = album.photos.filter((p) => p.approved).length;

  // Watermark Overlay Component (Watermark active with dynamic configurations)
  const WatermarkOverlay = () => {
    const active = album.watermarkActive !== undefined ? album.watermarkActive : true;
    if (!active) return null;

    const type = album.watermarkType || "image";
    const text = album.watermarkText || `Luana Santos © ${album.clientName}`;
    const opacity = album.watermarkOpacity !== undefined ? album.watermarkOpacity : 0.25;
    const size = album.watermarkSize || "md";
    const imageUrl = album.watermarkImageUrl || "https://i.ibb.co/CpPqYf91/AAA.png";

    return (
      <div
        id="client-watermark"
        className="absolute inset-0 z-10 pointer-events-none select-none flex flex-col justify-between p-3 overflow-hidden"
        style={{ opacity }}
      >
        <div className="flex justify-between w-full">
          <span className="text-[7px] tracking-widest text-white font-bold bg-black/40 px-1.5 py-0.5 rounded uppercase">Luana Santos Prova</span>
          <span className="text-[7px] tracking-widest text-white font-bold bg-black/40 px-1.5 py-0.5 rounded uppercase">Luana Santos Prova</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          {type === "text" ? (
            <div className="-rotate-25 text-white font-black tracking-widest text-center select-none whitespace-nowrap filter drop-shadow">
              <p 
                style={{ fontSize: `${Math.max(8, getNumericSize(size) / 8)}px` }}
              >
                {text}
              </p>
              <p 
                style={{ fontSize: `${Math.max(6, getNumericSize(size) / 12)}px` }}
                className="opacity-80 mt-0.5"
              >
                PROVA PROTEGIDA — NÃO UTILIZAR
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center select-none filter drop-shadow">
              <img
                src={imageUrl}
                alt="Watermark Logo"
                referrerPolicy="no-referrer"
                className="object-contain"
                style={{ height: `${getNumericSize(size)}px`, width: `${getNumericSize(size)}px` }}
              />
              {type === "both" && (
                <p 
                  style={{ fontSize: `${Math.max(6, getNumericSize(size) / 12)}px` }}
                  className="text-white font-bold tracking-widest mt-1 uppercase"
                >
                  {text}
                </p>
              )}
              <p 
                style={{ fontSize: `${Math.max(6, getNumericSize(size) / 12)}px` }}
                className="text-[#DFBA6B] font-black tracking-widest opacity-85 mt-0.5 uppercase"
              >
                RETIRAR MARCA D'ÁGUA É CRIME
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between w-full">
          <span className="text-[7px] tracking-widest text-white font-bold bg-black/40 px-1.5 py-0.5 rounded uppercase">PROPRIEDADE INTELECTUAL</span>
          <span className="text-[7px] tracking-widest text-white font-bold bg-black/40 px-1.5 py-0.5 rounded uppercase">PROPRIEDADE INTELECTUAL</span>
        </div>
      </div>
    );
  };

  // RENDER DEDICATED PASSWORD LOCK SCREEN
  if (!isUnlocked && album.password) {
    return (
      <div
        id="client-lock-screen"
        className="flex min-h-[80vh] items-center justify-center px-4 py-12 bg-[#050505] animate-fade-in"
      >
        <div
          id="client-password-card"
          className="w-full max-w-md rounded-3xl border border-zinc-900 bg-[#0d0d0d] p-8 shadow-2xl text-center space-y-6"
        >
          {/* Brand Logo */}
          <div className="mx-auto flex justify-center py-2">
            <img
              src="https://i.ibb.co/XBgjNvB/AAA.png"
              alt="Luana Santos Fotografia Logo"
              referrerPolicy="no-referrer"
              className="h-28 sm:h-36 w-auto object-contain"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-zinc-50 tracking-tight">
              {album.name}
            </h3>
            <p className="text-xs text-zinc-400">
              Olá, <strong className="font-semibold text-[#DFBA6B]">{album.clientName}</strong>! 
              Insira a senha definida para liberar o acesso às suas fotos.
            </p>
          </div>

          {/* Form */}
          <form id="client-password-form" onSubmit={handleUnlockSubmit} className="space-y-4">
            <input
              id="client-lock-password-input"
              type="password"
              required
              placeholder="Digite a senha do álbum"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMsg("");
              }}
              className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3.5 text-center text-sm font-bold tracking-widest text-zinc-100 focus:border-[#DFBA6B] focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/25"
            />

            {errorMsg && (
              <p id="client-password-error" className="text-xs font-bold text-red-400">
                {errorMsg}
              </p>
            )}

            <button
              id="btn-client-unlock"
              type="submit"
              className="w-full rounded-xl bg-gold-gradient py-3.5 text-sm font-bold text-black shadow-lg shadow-[#DFBA6B]/15 hover:bg-gold-hover transition-all"
            >
              Liberar Galeria Completa
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="client-album-view-root" className="space-y-8 animate-fade-in text-zinc-100">
      {/* 1. Gorgeous Dedicated Client-Side Header Banner */}
      <div
        id="client-banner"
        className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm"
      >
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {galleryTimeLeft && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 border border-zinc-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B8933D] animate-pulse"></span>
                  Expira em: {galleryTimeLeft}
                </span>
              )}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-serif">
              {album.name}
            </h2>
            <p className="text-sm text-zinc-600 font-medium">
              Olá, <strong className="text-[#B8933D] font-bold">{album.clientName}</strong>! Use os corações para favoritar as fotos que você mais gostou.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto">

          </div>
        </div>
      </div>

      {/* 2. TAB SELECTION & TABS */}
      <div className="border-b border-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button
              id="tab-all-photos"
              onClick={() => setActiveTab("all")}
              className={`relative pb-4 text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "text-[#DFBA6B] border-b-2 border-[#DFBA6B]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Todas as Fotos ({album.photos.length})
            </button>
            <button
              id="tab-fav-photos"
              onClick={() => setActiveTab("favorites")}
              className={`relative pb-4 text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "favorites"
                  ? "text-[#DFBA6B] border-b-2 border-[#DFBA6B]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Fotos Favoritadas ❤️ ({favoritesCount})
            </button>
          </div>


        </div>
      </div>

      {/* 3. PHOTOS GRID */}
      {filteredPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-16 text-center">
          <Heart className="h-12 w-12 text-zinc-700" />
          <h4 className="mt-4 text-base font-bold text-zinc-200">
            {activeTab === "favorites" ? "Nenhuma favorita ainda" : "Sem fotos"}
          </h4>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm">
            {activeTab === "favorites" 
              ? "Clique no coração das fotos que você mais amou para que elas apareçam nesta aba." 
              : "Não há fotos neste álbum."}
          </p>
          {activeTab === "favorites" && (
            <button
              id="btn-go-all-photos"
              onClick={() => setActiveTab("all")}
              className="mt-4 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-black"
            >
              Ver Todas as Fotos
            </button>
          )}
        </div>
      ) : (
        <div id="client-photos-grid" className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filteredPhotos.map((photo) => {
            const originalIndex = album.photos.findIndex((p) => p.id === photo.id);
            return (
              <div
                id={`client-photo-card-${photo.id}`}
                key={photo.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] shadow-sm transition-all hover:border-zinc-800"
              >
                {/* Image Wrap */}
                <div
                  id={`client-photo-img-wrapper-${photo.id}`}
                  onClick={() => setSelectedPhotoIndex(originalIndex)}
                  className="relative aspect-[3/2] overflow-hidden bg-zinc-950 cursor-zoom-in select-none"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] select-none pointer-events-none"
                  />

                  {/* Watermark Protection Overlay */}
                  <WatermarkOverlay />

                  {/* Fade-in overlay detail on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-4">
                    <span className="text-xs font-bold text-white truncate">
                      {photo.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Clique para expandir e ver em detalhes
                    </span>
                  </div>

                  {/* GOLD HEART STICKY ACCENT IF FAVORITED */}
                  {photo.approved && (
                    <div className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950/90 text-[#DFBA6B] border border-zinc-800 shadow-lg">
                      <Heart className="h-4.5 w-4.5 fill-[#DFBA6B] stroke-[#DFBA6B]" />
                    </div>
                  )}
                </div>

                {/* Footer Controls (Heart Icon Toggle Only) */}
                <div className="p-4 flex-1 flex flex-col justify-end">
                  {/* CORE REQUEST: Heart toggle icon button */}
                  <button
                    id={`btn-toggle-heart-${photo.id}`}
                    onClick={(e) => handleToggleHeart(photo.id, e)}
                    className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all w-full ${
                      photo.approved
                        ? "bg-[#DFBA6B]/15 text-[#DFBA6B] border border-[#DFBA6B]/30"
                        : "bg-zinc-950 text-zinc-400 border border-zinc-900 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 transition-transform group-active:scale-125 ${
                        photo.approved ? "fill-[#DFBA6B] stroke-[#DFBA6B]" : ""
                      }`}
                    />
                    {photo.approved ? "Favoritada" : "Favoritar Foto"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX FOR CLIENT */}
      {selectedPhotoIndex !== null && (
        <div
          id="client-lightbox-backdrop"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 p-4"
        >
          {/* Top Panel bar */}
          <div className="flex items-center justify-between bg-gradient-to-b from-zinc-900/90 to-transparent p-4 text-white">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">
                {album.photos[selectedPhotoIndex].name}
              </h4>
              <p className="text-xs text-zinc-400">
                Foto {selectedPhotoIndex + 1} de {album.photos.length}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                id="lightbox-close-btn-client"
                onClick={() => setSelectedPhotoIndex(null)}
                className="rounded-full bg-white/10 p-2.5 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Central image view with watermarks */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <button
              id="btn-prev-lightbox-client"
              onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + album.photos.length) % album.photos.length)}
              className="absolute left-4 z-30 rounded-full bg-black/50 p-3 text-white hover:bg-black/85 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="relative max-w-full max-h-[75vh] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 select-none">
              <img
                src={album.photos[selectedPhotoIndex].url}
                alt="lightbox"
                className="object-contain max-h-[75vh] mx-auto select-none pointer-events-none"
              />
              <WatermarkOverlay />
            </div>

            <button
              id="btn-next-lightbox-client"
              onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % album.photos.length)}
              className="absolute right-4 z-30 rounded-full bg-black/50 p-3 text-white hover:bg-black/85 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Panel bar with Favorite button */}
          <div className="bg-gradient-to-t from-zinc-900/90 to-transparent p-6 flex flex-col items-center gap-3 text-center">
            {/* Heart Toggle on Lightbox */}
            <button
              id="lightbox-toggle-heart"
              onClick={(e) => handleToggleHeart(album.photos[selectedPhotoIndex].id, e)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all shadow-lg cursor-pointer ${
                album.photos[selectedPhotoIndex].approved
                  ? "bg-gold-gradient text-black"
                  : "bg-white/10 text-zinc-100 hover:bg-white/20 border border-white/5"
              }`}
            >
              <Heart
                className={`h-4.5 w-4.5 ${album.photos[selectedPhotoIndex].approved ? "fill-black stroke-black" : ""}`}
              />
              {album.photos[selectedPhotoIndex].approved ? "Favoritada" : "Favoritar Foto"}
            </button>
            <p className="text-xs text-zinc-400">
              Marque esta foto como favorita clicando no botão acima.
            </p>
          </div>
        </div>
      )}

      {/* Embedded print protection styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html, #root, #client-photos-grid, #client-lightbox-backdrop {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}} />

      {/* Floating anti-screenshot and warning toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-zinc-950/95 border border-[#DFBA6B]/30 px-5 py-3 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-3 max-w-md animate-slide-up">
          <div className="h-2 w-2 rounded-full bg-[#DFBA6B] animate-pulse shrink-0" />
          <p className="text-xs font-bold text-zinc-100 leading-normal">
            {toastMessage}
          </p>
        </div>
      )}

      {/* Full screen solid pitch black protection overlay when window loses focus (preventing screenshot tools) */}
      {isUnlocked && isBlurred && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black p-6 text-center select-none pointer-events-none">
          <div className="rounded-full bg-zinc-900/40 p-4 border border-zinc-800/50 mb-3">
            <Lock className="h-6 w-6 text-zinc-600 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-500 tracking-wider uppercase mb-1">
            Luana Santos Fotografia
          </h3>
          <p className="text-xs text-zinc-700">
            Modo de Proteção Ativo — Conteúdo de Visualização Privado
          </p>
        </div>
      )}
    </div>
  );
}
