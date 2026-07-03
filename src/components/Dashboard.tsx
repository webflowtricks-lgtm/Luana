import React, { useState } from "react";
import { Album, Stats } from "../types";
import { Users, FolderOpen, Image as ImageIcon, Eye, HardDrive, Lock, Plus, Trash2, ArrowRight, Share2, Unlock, AlertTriangle, X, Copy, Check } from "lucide-react";
import Logo from "./Logo";

interface DashboardProps {
  albums: Album[];
  onSelectAlbum: (id: string) => void;
  onNewAlbumClick: () => void;
  onDeleteAlbum: (id: string) => void;
}

export default function Dashboard({
  albums,
  onSelectAlbum,
  onNewAlbumClick,
  onDeleteAlbum,
}: DashboardProps) {
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate dynamic stats
  const uniqueClients = new Set(albums.map((a) => a.clientName.trim())).size;
  const totalAlbums = albums.length;
  const totalPhotos = albums.reduce((acc, a) => acc + a.photos.length, 0);
  const totalViews = albums.reduce((acc, a) => acc + a.views, 0);
  const totalStorage = albums.reduce(
    (acc, a) => acc + a.photos.reduce((pAcc, p) => pAcc + (p.size || 0), 0),
    0
  );

  // Format storage size helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleCopyLink = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?album=${albumId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(albumId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div id="dashboard-root" className="space-y-8 animate-fade-in">
      {/* Brand Logo Header */}
      <div className="flex justify-center py-4">
        <Logo className="h-28 sm:h-36" />
      </div>

      {/* Visual Header / Banner */}
      <div
        id="dashboard-banner"
        className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#12100e] via-[#050505] to-[#1a160f] p-8 flex items-center justify-center"
      >
        <button
          id="btn-banner-new-album"
          onClick={onNewAlbumClick}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gold-gradient px-6 text-sm font-bold text-black shadow-lg shadow-[#DFBA6B]/10 transition-transform hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Criar Álbum
        </button>
      </div>

      {/* Stats Grid */}
      <section id="stats-section" className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {/* Clients Stat */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-5 shadow-sm transition-all hover:border-[#DFBA6B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Clientes Atendidos
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#DFBA6B]">
                {uniqueClients}
              </p>
            </div>
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2.5 text-[#DFBA6B]">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Albums Stat */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-5 shadow-sm transition-all hover:border-[#DFBA6B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total de Álbuns
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#DFBA6B]">
                {totalAlbums}
              </p>
            </div>
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2.5 text-[#DFBA6B]">
              <FolderOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Photos Stat */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-5 shadow-sm transition-all hover:border-[#DFBA6B]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Fotos Publicadas
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#DFBA6B]">
                {totalPhotos}
              </p>
            </div>
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2.5 text-[#DFBA6B]">
              <ImageIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Storage Stat */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] p-5 shadow-sm transition-all hover:border-[#DFBA6B]/20 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Espaço em Disco
              </p>
              <p className="mt-2 text-xl font-extrabold text-zinc-100 truncate">
                {formatBytes(totalStorage)}
              </p>
            </div>
            <div className="rounded-xl bg-[#DFBA6B]/10 p-2.5 text-[#DFBA6B]">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section id="albums-section" className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-50 font-serif">
              Galerias Ativas ({totalAlbums})
            </h3>
            <p className="text-xs text-zinc-400">
              Gerencie as pastas dos clientes e confira as senhas configuradas.
            </p>
          </div>
        </div>

        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-12 text-center">
            <FolderOpen className="h-12 w-12 text-zinc-700" />
            <h4 className="mt-4 text-base font-bold text-zinc-200">Nenhum álbum criado ainda</h4>
            <p className="mt-1 text-sm text-zinc-500 max-w-sm">
              Comece criando seu primeiro álbum de fotos e defina uma senha exclusiva para o seu cliente acessar.
            </p>
            <button
              id="btn-empty-state-new"
              onClick={onNewAlbumClick}
              className="mt-4 rounded-full bg-gold-gradient px-6 py-2.5 text-sm font-bold text-black"
            >
              Criar Primeiro Álbum
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <div
                id={`album-card-${album.id}`}
                key={album.id}
                onClick={() => onSelectAlbum(album.id)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-900 bg-[#0d0d0d] shadow-md transition-all hover:border-[#DFBA6B]/40 cursor-pointer"
              >
                {/* Album Cover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                  <img
                    src={album.coverUrl}
                    alt={album.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Password Badge - CRITICAL REQ VISUAL */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/90 px-2.5 py-1 text-xs font-bold text-white border border-[#DFBA6B]/30 backdrop-blur-sm">
                    {album.password ? (
                      <>
                        <Lock className="h-3 w-3 text-[#DFBA6B]" />
                        <span>Senha: <span className="font-mono text-[#DFBA6B]">{album.password}</span></span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Sem Senha</span>
                      </>
                    )}
                  </div>

                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    <button
                      id={`btn-share-album-${album.id}`}
                      title="Copiar link do cliente"
                      onClick={(e) => handleCopyLink(album.id, e)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                        copiedId === album.id 
                          ? "bg-emerald-600 text-white" 
                          : "bg-black/80 text-zinc-300 hover:text-white border border-zinc-850"
                      }`}
                    >
                      {copiedId === album.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      id={`btn-delete-album-${album.id}`}
                      title="Excluir álbum"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAlbumToDelete(album);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-950/80 text-red-300 backdrop-blur-sm hover:text-red-100 transition-colors border border-red-900/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Number of Photos overlay */}
                  <div className="absolute bottom-3 right-3 rounded-md bg-black/90 px-2 py-0.5 text-[10px] font-extrabold text-white border border-zinc-800 backdrop-blur-sm">
                    {album.photos.length} FOTOS
                  </div>
                </div>

                {/* Album Meta */}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFBA6B]">
                    Cliente: {album.clientName}
                  </span>
                  <h4 className="mt-1 font-bold text-zinc-100 group-hover:text-[#DFBA6B] transition-colors font-serif text-lg">
                    {album.name}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                    {album.description || "Nenhuma descrição informada."}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-end border-t border-zinc-900 text-xs">
                    <button
                      id={`btn-copy-link-bottom-${album.id}`}
                      onClick={(e) => handleCopyLink(album.id, e)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${
                        copiedId === album.id
                          ? "text-emerald-400"
                          : "text-[#DFBA6B] hover:text-[#f1e0b5]"
                      }`}
                    >
                      {copiedId === album.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Link Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copiar Link do Álbum
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {albumToDelete && (
        <div
          id="delete-confirmation-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            id="delete-confirmation-card"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-[#0d0d0d] p-6 shadow-2xl animate-slide-up space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-950/40 text-red-400 border border-red-900/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-zinc-100">
                  Tem certeza que deseja excluir?
                </h3>
                <p className="text-xs text-zinc-400">
                  Você está prestes a excluir o álbum <strong className="font-semibold text-zinc-200">"{albumToDelete.name}"</strong> do cliente <strong className="font-semibold text-zinc-200">{albumToDelete.clientName}</strong>. 
                </p>
                <p className="text-[11px] font-medium text-red-400">
                  Esta ação é permanente e removerá todas as {albumToDelete.photos.length} fotos e avaliações do cliente.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
              <button
                id="btn-cancel-delete"
                type="button"
                onClick={() => setAlbumToDelete(null)}
                className="rounded-full px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              >
                Não, manter álbum
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={() => {
                  onDeleteAlbum(albumToDelete.id);
                  setAlbumToDelete(null);
                }}
                className="rounded-full bg-red-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-500/10"
              >
                Sim, excluir definitivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
