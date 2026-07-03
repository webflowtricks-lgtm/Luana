import React, { useState, useEffect } from "react";
import { Album, Photo } from "../types";
import {
  ArrowLeft,
  Lock,
  Eye,
  Check,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Sliders,
  Sparkles,
  RefreshCw,
  Camera,
  Unlock,
  Save
} from "lucide-react";

interface AlbumDetailProps {
  album: Album;
  onBack: () => void;
  onUpdateAlbum: (updatedAlbum: Album) => void;
  isUnlockedInitially: boolean;
  onUnlockAlbum: (id: string) => void;
  viewRole: "photographer" | "client";
}

const getNumericSize = (sizeStr: string): number => {
  if (sizeStr === "sm") return 64;
  if (sizeStr === "md") return 112;
  if (sizeStr === "lg") return 176;
  const parsed = parseInt(sizeStr, 10);
  return isNaN(parsed) ? 112 : parsed;
};

export default function AlbumDetail({
  album,
  onBack,
  onUpdateAlbum,
  isUnlockedInitially,
  onUnlockAlbum,
  viewRole,
}: AlbumDetailProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Custom 1.5 hours local cache verification logic
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (viewRole === "photographer") return true;
    if (!album.password) return true;
    const savedTimestamp = localStorage.getItem(`lumiere_unlocked_at_${album.id}`);
    if (!savedTimestamp) return false;
    const unlockedAt = parseInt(savedTimestamp, 10);
    if (isNaN(unlockedAt)) return false;
    return (Date.now() - unlockedAt) < (1.5 * 60 * 60 * 1000); // 1.5 hours
  });

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Watermark parameters
  const [watermarkActive, setWatermarkActive] = useState(() => album.watermarkActive !== undefined ? album.watermarkActive : true);
  const [watermarkType, setWatermarkType] = useState<"image" | "text" | "both">(album.watermarkType || "image");
  const [watermarkImageUrl, setWatermarkImageUrl] = useState(album.watermarkImageUrl || "https://i.ibb.co/CpPqYf91/AAA.png");
  const [watermarkText, setWatermarkText] = useState(album.watermarkText || `Luana Santos © ${album.clientName}`);
  const [watermarkOpacity, setWatermarkOpacity] = useState(album.watermarkOpacity !== undefined ? album.watermarkOpacity : 0.25); // 0.25 means 25% opacity
  const [watermarkSize, setWatermarkSize] = useState(album.watermarkSize || "md"); // sm, md, lg

  const [isSavingWatermark, setIsSavingWatermark] = useState(false);
  const [saveWatermarkSuccess, setSaveWatermarkSuccess] = useState(false);

  // Sync watermark settings state if album ID changes (switching albums)
  useEffect(() => {
    setWatermarkActive(album.watermarkActive !== undefined ? album.watermarkActive : true);
    setWatermarkType(album.watermarkType || "image");
    setWatermarkImageUrl(album.watermarkImageUrl || "https://i.ibb.co/CpPqYf91/AAA.png");
    setWatermarkText(album.watermarkText || `Luana Santos © ${album.clientName}`);
    setWatermarkOpacity(album.watermarkOpacity !== undefined ? album.watermarkOpacity : 0.25);
    setWatermarkSize(album.watermarkSize || "md");
  }, [album.id]);

  const handleSaveWatermarkSettings = () => {
    setIsSavingWatermark(true);
    const updatedAlbum: Album = {
      ...album,
      watermarkActive,
      watermarkType,
      watermarkText,
      watermarkOpacity,
      watermarkSize,
      watermarkImageUrl,
    };
    onUpdateAlbum(updatedAlbum);
    setTimeout(() => {
      setIsSavingWatermark(false);
      setSaveWatermarkSuccess(true);
      setTimeout(() => setSaveWatermarkSuccess(false), 3000);
    }, 500);
  };

  // Selected photo for Lightbox
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Force isUnlocked update if role, album, or props change
  useEffect(() => {
    if (viewRole === "photographer") {
      setIsUnlocked(true);
    } else {
      if (!album.password) {
        setIsUnlocked(true);
      } else {
        const savedTimestamp = localStorage.getItem(`lumiere_unlocked_at_${album.id}`);
        if (savedTimestamp) {
          const unlockedAt = parseInt(savedTimestamp, 10);
          if (!isNaN(unlockedAt) && (Date.now() - unlockedAt) < (1.5 * 60 * 60 * 1000)) {
            setIsUnlocked(true);
            return;
          }
        }
        setIsUnlocked(false);
      }
    }
  }, [viewRole, album.id, album.password]);

  // Reactive countdown timer to expire password after 1.5 hours (90 minutes)
  useEffect(() => {
    if (!isUnlocked || viewRole === "photographer" || !album.password) {
      setSecondsLeft(null);
      return;
    }

    const updateCountdown = () => {
      const savedTimestamp = localStorage.getItem(`lumiere_unlocked_at_${album.id}`);
      if (!savedTimestamp) {
        setIsUnlocked(false);
        setSecondsLeft(null);
        return;
      }
      const unlockedAt = parseInt(savedTimestamp, 10);
      if (isNaN(unlockedAt)) {
        setIsUnlocked(false);
        setSecondsLeft(null);
        return;
      }
      const limitMs = 1.5 * 60 * 60 * 1000; // 1.5 hours
      const elapsed = Date.now() - unlockedAt;
      const remainingMs = limitMs - elapsed;

      if (remainingMs <= 0) {
        setIsUnlocked(false);
        setSecondsLeft(null);
        localStorage.removeItem(`lumiere_unlocked_at_${album.id}`);
        alert("Sua sessão de visualização de 1 hora e meia expirou. Por segurança, digite a senha do álbum novamente.");
      } else {
        setSecondsLeft(Math.floor(remainingMs / 1000));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked, viewRole, album.id, album.password]);

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
      // Shakes the form
      const el = document.getElementById("password-form");
      if (el) {
        el.classList.add("animate-shake");
        setTimeout(() => el.classList.remove("animate-shake"), 500);
      }
    }
  };

  // Helper to manually lock album for easy password-reentry testing
  const handleManualLock = () => {
    localStorage.removeItem(`lumiere_unlocked_at_${album.id}`);
    setIsUnlocked(false);
    setSecondsLeft(null);
    setPasswordInput("");
  };

  const formatTimeLeft = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const hrsStr = hrs > 0 ? `${hrs}h ` : "";
    const minsStr = mins > 0 ? `${mins}m ` : "";
    return `${hrsStr}${minsStr}${secs}s`;
  };

  // Toggle photo approval
  const handleToggleApprove = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPhotos = album.photos.map((photo) => {
      if (photo.id === photoId) {
        return { ...photo, approved: !photo.approved };
      }
      return photo;
    });
    onUpdateAlbum({ ...album, photos: updatedPhotos });
  };

  // Count approved
  const approvedCount = album.photos.filter((p) => p.approved).length;

  // Render Lock Screen if not unlocked (for client mode)
  if (!isUnlocked && album.password) {
    return (
      <div
        id="lock-screen-container"
        className="flex min-h-[70vh] items-center justify-center px-4 py-12 bg-[#050505] animate-fade-in text-zinc-100"
      >
        <div
          id="password-form-card"
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
              Olá, <span className="font-bold text-[#DFBA6B]">{album.clientName}</span>! Insira a senha fornecida pelo fotógrafo para visualizá-la.
            </p>
          </div>

          {/* Form */}
          <form id="password-form" onSubmit={handleUnlockSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="lock-password-input"
                type="password"
                required
                placeholder="Insira a senha do álbum"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-3.5 text-center text-sm font-bold tracking-widest text-zinc-100 focus:border-[#DFBA6B] focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/25"
              />
            </div>

            {errorMsg && (
              <p id="password-error" className="text-xs font-bold text-red-400 animate-shake">
                {errorMsg}
              </p>
            )}

            <button
              id="btn-submit-unlock"
              type="submit"
              className="w-full rounded-xl bg-gold-gradient py-3.5 text-sm font-bold text-black shadow-lg shadow-[#DFBA6B]/15 hover:bg-gold-hover transition-all"
            >
              Liberar Minha Galeria
            </button>
          </form>

          {/* Helpful interactive debug note */}
          <div className="rounded-xl bg-zinc-950 p-3.5 border border-zinc-900 text-left">
            <p className="text-[11px] font-bold text-[#DFBA6B] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Dica para teste:
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Como você acabou de simular a criação/acesso a esse álbum, use a senha configurada pelo fotógrafo: <strong className="font-mono text-[#DFBA6B] px-1 bg-zinc-900 border border-zinc-850 rounded">{album.password}</strong> para entrar.
            </p>
          </div>


        </div>
      </div>
    );
  }

  // Watermark layout component
  const WatermarkOverlay = () => {
    if (!watermarkActive) return null;
    return (
      <div
        id="watermark-overlay"
        style={{ opacity: watermarkOpacity }}
        className="absolute inset-0 z-10 pointer-events-none select-none flex flex-col justify-between p-4 overflow-hidden"
      >
        <div className="flex justify-between w-full">
          <span className="text-[8px] tracking-wider text-white font-bold bg-black/40 px-1.5 py-0.5 rounded shadow-sm uppercase">Luana Santos Prova</span>
          <span className="text-[8px] tracking-wider text-white font-bold bg-black/40 px-1.5 py-0.5 rounded shadow-sm uppercase">Luana Santos Prova</span>
        </div>
        
        {/* Repeating diagonal watermark text or luxury logo image in center */}
        <div className="flex-1 flex items-center justify-center">
          {watermarkType === "text" ? (
            <div className="-rotate-30 text-white font-black tracking-widest text-center select-none whitespace-nowrap filter drop-shadow">
              <p 
                style={{ fontSize: `${Math.max(10, getNumericSize(watermarkSize) / 8)}px` }}
              >
                {watermarkText}
              </p>
              <p 
                style={{ fontSize: `${Math.max(7, getNumericSize(watermarkSize) / 12)}px` }}
                className="opacity-80 mt-1"
              >
                AMOSTRA NÃO APROVADA PARA USO
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center select-none filter drop-shadow">
              <img
                src={watermarkImageUrl}
                alt="Watermark Logo"
                referrerPolicy="no-referrer"
                className="object-contain transition-all"
                style={{ height: `${getNumericSize(watermarkSize)}px`, width: `${getNumericSize(watermarkSize)}px` }}
              />
              {watermarkType === "both" && (
                <p 
                  style={{ fontSize: `${Math.max(7, getNumericSize(watermarkSize) / 12)}px` }}
                  className="text-white font-bold tracking-widest mt-2 uppercase"
                >
                  {watermarkText}
                </p>
              )}
              <p 
                style={{ fontSize: `${Math.max(7, getNumericSize(watermarkSize) / 12)}px` }}
                className="text-[#DFBA6B] font-black tracking-widest opacity-85 mt-1 uppercase"
              >
                RETIRAR MARCA D'ÁGUA É CRIME
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between w-full">
          <span className="text-[8px] tracking-wider text-white font-bold bg-black/40 px-1.5 py-0.5 rounded shadow-sm uppercase">PROPRIEDADE INTELECTUAL</span>
          <span className="text-[8px] tracking-wider text-white font-bold bg-black/40 px-1.5 py-0.5 rounded shadow-sm uppercase">PROPRIEDADE INTELECTUAL</span>
        </div>
      </div>
    );
  };

  const handleDownloadImage = (url: string, name: string) => {
    // Standard simulation of download
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`Iniciando download da imagem: ${name}\nNota: Em produção, esta imagem é salva em alta resolução sem marcas d'água após a aprovação do pagamento.`);
  };

  return (
    <div id="album-detail-root" className="space-y-6 animate-fade-in text-zinc-100">
      {/* Top Bar with metadata and action to go back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-start gap-3">
          <button
            id="btn-detail-back"
            onClick={onBack}
            className="mt-1 rounded-full border border-zinc-800 bg-zinc-950 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DFBA6B]">
                Cliente: {album.clientName}
              </span>
              {album.password && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#DFBA6B]/10 border border-[#DFBA6B]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#DFBA6B]">
                  <Lock className="h-2.5 w-2.5" /> Protegido por Senha
                </span>
              )}
              {secondsLeft !== null && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#DFBA6B]/15 border border-[#DFBA6B]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#DFBA6B]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DFBA6B] animate-pulse"></span>
                    Sessão expira em: {formatTimeLeft(secondsLeft)}
                  </span>
                  <button
                    id="btn-manual-lock"
                    onClick={handleManualLock}
                    className="rounded-full bg-zinc-950 hover:bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-850"
                    title="Limpar cache local e exigir senha imediatamente"
                  >
                    Bloquear Galeria (Testar Senha)
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold font-serif text-zinc-100 tracking-tight mt-0.5">
              {album.name}
            </h2>
            <p className="text-xs text-zinc-400">
              {album.description || "Sem descrição informada."}
            </p>
          </div>
        </div>

        {/* Gallery Stats / Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Seleção do Cliente
            </p>
            <p className="text-sm font-bold text-zinc-200">
              {approvedCount} de {album.photos.length} fotos aprovadas
            </p>
          </div>

          <div className="h-8 w-px bg-zinc-900"></div>

          {/* Quick info if in Photographer view */}
          {viewRole === "photographer" ? (
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2 text-xs border border-[#DFBA6B]/20">
              <span className="font-bold text-[#DFBA6B]">Modo Fotógrafo Ativo</span>
              <p className="text-[10px] text-zinc-400">Você tem controle total sobre o álbum.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2 text-xs border border-[#DFBA6B]/20">
              <span className="font-bold text-[#DFBA6B]">Modo Cliente Ativo</span>
              <p className="text-[10px] text-zinc-400">Aprove suas fotos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Watermark Configurator Panel */}
      <div
        id="watermark-config-panel"
        className="rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-[#DFBA6B]" />
            Configurações de Proteção (Marca d'Água Dinâmica)
          </h4>
          <label className="relative inline-flex items-center cursor-pointer font-bold">
            <input
              type="checkbox"
              checked={watermarkActive}
              onChange={(e) => setWatermarkActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#DFBA6B]"></div>
            <span className="ml-2 text-xs font-bold text-zinc-400">Ativa</span>
          </label>
        </div>

        {watermarkActive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tipo de Marca d'Água
              </label>
              <div className="flex gap-1 rounded-lg bg-zinc-950 border border-zinc-900 p-0.5">
                {[
                  { value: "image", label: "Logo PNG" },
                  { value: "text", label: "Texto" },
                  { value: "both", label: "Ambos" },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setWatermarkType(t.value as any)}
                    className={`flex-1 rounded py-1 text-[9px] font-bold uppercase transition-colors ${
                      watermarkType === t.value
                        ? "bg-[#DFBA6B]/15 text-[#DFBA6B] border border-[#DFBA6B]/25 font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Texto / Identificação
              </label>
              <input
                id="watermark-text-input"
                type="text"
                value={watermarkText}
                disabled={watermarkType === "image"}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full rounded-lg border border-zinc-850 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:border-[#DFBA6B] focus:outline-none disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Opacidade ({Math.round(watermarkOpacity * 100)}%)
              </label>
              <input
                id="watermark-opacity-range"
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#DFBA6B] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tamanho da Marca ({getNumericSize(watermarkSize)}px)
              </label>
              <div className="flex items-center gap-2 py-1.5">
                <input
                  id="watermark-size-range"
                  type="range"
                  min="40"
                  max="300"
                  step="5"
                  value={getNumericSize(watermarkSize)}
                  onChange={(e) => setWatermarkSize(e.target.value)}
                  className="w-full accent-[#DFBA6B] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save button for watermark config */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-zinc-900/60 mt-3">
          <p className="text-[10px] text-zinc-500">
            * Estas configurações definem o visual da marca d'água de proteção na visualização de prova do cliente.
          </p>
          <button
            type="button"
            onClick={handleSaveWatermarkSettings}
            disabled={isSavingWatermark}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-black shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSavingWatermark ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-black border-t-transparent"></span>
                <span>Salvando...</span>
              </>
            ) : saveWatermarkSuccess ? (
              <>
                <Check className="h-4 w-4 stroke-[3.5] text-black" />
                <span>Salvo com sucesso!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Salvar Configurações de Marca d'Água</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty State for photos */}
      {album.photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-12 text-center">
          <Camera className="h-12 w-12 text-zinc-750" />
          <h4 className="mt-4 text-base font-bold text-zinc-250">Não há fotos no álbum</h4>
          <p className="mt-1 text-sm text-zinc-500">
            Adicione imagens a este álbum editando ele no painel do fotógrafo.
          </p>
        </div>
      ) : (
        /* Photos Grid */
        <div id="photos-grid" className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {album.photos.map((photo, index) => (
            <div
              id={`photo-card-${photo.id}`}
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] shadow-sm transition-all hover:border-zinc-800"
            >
              {/* Photo Image Wrapper */}
              <div
                id={`photo-img-wrapper-${photo.id}`}
                onClick={() => setSelectedPhotoIndex(index)}
                className="relative aspect-[3/2] overflow-hidden bg-zinc-950 cursor-zoom-in"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />

                {/* THE DYNAMIC WATERMARK OVERLAY */}
                <WatermarkOverlay />

                {/* Status Badges on hover/active */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-4">
                  <span className="text-xs font-semibold text-white/95 truncate">
                    {photo.name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {(photo.size / (1024 * 1024)).toFixed(2)} MB • Clique para ampliar
                  </span>
                </div>

                {/* Permanent Approved Badge */}
                {photo.approved && (
                  <div className="absolute bottom-3 left-3 z-20 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
                    <Check className="h-3 w-3 stroke-[2.5]" /> APROVADA
                  </div>
                )}
              </div>

              {/* Photo Interactivity Bar */}
              <div className="p-4 flex-1 flex flex-col justify-end">
                {/* Approve/Disapprove client toggle */}
                <button
                  id={`btn-approve-${photo.id}`}
                  onClick={(e) => handleToggleApprove(photo.id, e)}
                  className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all w-full ${
                    photo.approved
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                      : "bg-zinc-950 text-zinc-400 border border-zinc-900 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <Check className={`h-3.5 w-3.5 ${photo.approved ? "stroke-[3]" : ""}`} />
                  {photo.approved ? "Aprovada" : "Aprovar Foto"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhotoIndex !== null && (
        <div
          id="lightbox-backdrop"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 p-4"
        >
          {/* Top panel */}
          <div className="flex items-center justify-between bg-gradient-to-b from-zinc-900/80 to-transparent p-4 text-white">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">
                {album.photos[selectedPhotoIndex].name}
              </h4>
              <p className="text-xs text-zinc-400">
                Foto {selectedPhotoIndex + 1} de {album.photos.length}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick approval toggle in Lightbox */}
              <button
                id="lightbox-approve-btn"
                onClick={(e) => handleToggleApprove(album.photos[selectedPhotoIndex].id, e)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  album.photos[selectedPhotoIndex].approved
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-white/10 text-zinc-200 hover:bg-white/20"
                }`}
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                {album.photos[selectedPhotoIndex].approved ? "Aprovada" : "Aprovar"}
              </button>

              <button
                id="lightbox-download-btn"
                onClick={() => handleDownloadImage(album.photos[selectedPhotoIndex].url, album.photos[selectedPhotoIndex].name)}
                className="rounded-full bg-white/10 p-2.5 hover:bg-white/20 text-white"
                title="Download da imagem"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                id="lightbox-close-btn"
                onClick={() => setSelectedPhotoIndex(null)}
                className="rounded-full bg-white/10 p-2.5 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Core image display with watermarks */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <button
              id="btn-prev-lightbox"
              onClick={() => setSelectedPhotoIndex((selectedPhotoIndex - 1 + album.photos.length) % album.photos.length)}
              className="absolute left-4 z-30 rounded-full bg-black/50 p-3 text-white hover:bg-black/85 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Dynamic visual preview overlay box */}
            <div className="relative max-w-full max-h-[75vh] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800">
              <img
                src={album.photos[selectedPhotoIndex].url}
                alt="lightbox view"
                className="object-contain max-h-[75vh] mx-auto select-none"
              />
              
              {/* Force watermarks onto lightbox preview too */}
              <WatermarkOverlay />
            </div>

            <button
              id="btn-next-lightbox"
              onClick={() => setSelectedPhotoIndex((selectedPhotoIndex + 1) % album.photos.length)}
              className="absolute right-4 z-30 rounded-full bg-black/50 p-3 text-white hover:bg-black/85 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom metadata panel */}
          <div className="bg-gradient-to-t from-zinc-900/80 to-transparent p-4 text-center text-xs text-zinc-400">
            <p>Selecione suas fotos favoritas utilizando o botão Aprovar.</p>
          </div>
        </div>
      )}
    </div>
  );
}
