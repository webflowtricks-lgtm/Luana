import React, { useState, useRef } from "react";
import { X, Lock, Image as ImageIcon, Upload, Key, Check } from "lucide-react";
import { Album, Photo } from "../types";
import { MOCK_STOCK_IMAGES } from "../data";

interface NewAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (album: Omit<Album, "id" | "createdAt" | "views">) => void;
}

export default function NewAlbumModal({ isOpen, onClose, onSave }: NewAlbumModalProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  
  // Choose how to populate photos: stock category or custom uploads
  const [photoSource, setPhotoSource] = useState<"stock" | "upload">("stock");
  const [selectedStockCategory, setSelectedStockCategory] = useState(MOCK_STOCK_IMAGES[0].category);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file uploads and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const newPhotos: Photo[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const photo: Photo = {
            id: Math.random().toString(36).substring(2, 9),
            url: reader.result,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          setUploadedPhotos((prev) => [...prev, photo]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveUploadedPhoto = (id: string) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientName) {
      alert("Por favor, preencha o Nome do Álbum e o Nome do Cliente.");
      return;
    }

    let photosToSave: Photo[] = [];
    let coverUrl = "";

    if (photoSource === "stock") {
      const categoryData = MOCK_STOCK_IMAGES.find(
        (c) => c.category === selectedStockCategory
      );
      if (categoryData) {
        photosToSave = categoryData.urls.map((url, index) => ({
          id: `stock-${selectedStockCategory}-${index}-${Math.random()}`,
          url,
          name: `foto_${index + 1}.jpg`,
          size: Math.floor(Math.random() * 2000000) + 1500000, // mock size
          uploadedAt: new Date().toISOString(),
        }));
        coverUrl = categoryData.urls[0];
      }
    } else {
      photosToSave = uploadedPhotos;
      coverUrl = uploadedPhotos[0]?.url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80";
    }

    onSave({
      name,
      clientName,
      description,
      password: password.trim() || undefined, // password defined during album creation
      photos: photosToSave,
      coverUrl,
    });

    // Reset form
    setName("");
    setClientName("");
    setDescription("");
    setPassword("");
    setUploadedPhotos([]);
    onClose();
  };

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div
        id="modal-container"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-900 bg-[#0d0d0d] shadow-2xl animate-slide-up text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DFBA6B]/15 text-[#DFBA6B]">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h3 id="modal-title" className="text-lg font-bold text-zinc-100 font-serif">
              Criar Novo Álbum Protegido
            </h3>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#DFBA6B] mb-1.5">
                Nome do Álbum *
              </label>
              <input
                id="input-album-name"
                type="text"
                required
                placeholder="Ex: Casamento Mariana & Roberto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-[#DFBA6B] focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#DFBA6B] mb-1.5">
                Nome do Cliente *
              </label>
              <input
                id="input-client-name"
                type="text"
                required
                placeholder="Ex: Mariana & Roberto"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-[#DFBA6B] focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#DFBA6B] mb-1.5">
              Descrição do Álbum
            </label>
            <textarea
              id="input-album-description"
              rows={2}
              placeholder="Ex: Sessão fotográfica externa realizada no entardecer."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-850 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 focus:border-[#DFBA6B] focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/20"
            />
          </div>

          {/* PASSWORD LOCK - CORE FEATURE REQUEST */}
          <div className="rounded-2xl border border-[#DFBA6B]/20 bg-[#DFBA6B]/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DFBA6B]/15 text-[#DFBA6B]">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-zinc-100">
                    Definir Senha de Acesso
                  </label>
                  <span className="rounded-full bg-[#DFBA6B]/15 border border-[#DFBA6B]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#DFBA6B]">
                    Obrigatório
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Conforme solicitado, essa senha impede o acesso direto ao álbum. Ao visitar a galeria, o cliente precisará digitá-la para liberar as fotos.
                </p>
                <div className="relative mt-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    id="input-album-password"
                    type="text"
                    required
                    placeholder="Ex: 123, amor2026, segredo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-100 font-mono font-medium tracking-wider focus:border-[#DFBA6B] focus:outline-none focus:ring-1 focus:ring-[#DFBA6B]/25"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fotos Source Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Fotos do Álbum
            </label>
            <div className="flex gap-2 rounded-xl bg-zinc-950 p-1 border border-zinc-900">
              <button
                id="tab-source-stock"
                type="button"
                onClick={() => setPhotoSource("stock")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  photoSource === "stock"
                    ? "bg-[#DFBA6B]/10 text-[#DFBA6B] shadow-sm border border-[#DFBA6B]/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Usar Fotos de Demonstração
              </button>
              <button
                id="tab-source-upload"
                type="button"
                onClick={() => setPhotoSource("upload")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  photoSource === "upload"
                    ? "bg-[#DFBA6B]/10 text-[#DFBA6B] shadow-sm border border-[#DFBA6B]/20"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Upload de Fotos Próprias
              </button>
            </div>

            {photoSource === "stock" ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Selecione um pacote de fotos profissionais pré-carregadas para o álbum:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_STOCK_IMAGES.map((cat) => (
                    <button
                      id={`stock-cat-${cat.category}`}
                      key={cat.category}
                      type="button"
                      onClick={() => setSelectedStockCategory(cat.category)}
                      className={`relative flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        selectedStockCategory === cat.category
                          ? "border-[#DFBA6B] bg-[#DFBA6B]/10 text-[#DFBA6B]"
                          : "border-zinc-900 bg-zinc-950 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-bold">{cat.category}</span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {cat.urls.length} fotos inclusas
                      </span>
                      {selectedStockCategory === cat.category && (
                        <div className="absolute right-1.5 top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-gradient text-black">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Upload drag drop */}
                <div
                  id="drag-drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-[#DFBA6B] bg-[#DFBA6B]/5"
                      : "border-zinc-800 bg-zinc-950 hover:border-[#DFBA6B]/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
                    <Upload className="h-5 w-5 text-[#DFBA6B]" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-zinc-200">
                    Arraste fotos ou clique para fazer upload
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Suporta arquivos JPG, PNG ou WEBP.
                  </p>
                </div>

                {/* Grid of uploaded images */}
                {uploadedPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
                      <span>{uploadedPhotos.length} fotos carregadas</span>
                      <button
                        type="button"
                        onClick={() => setUploadedPhotos([])}
                        className="text-red-400 hover:underline"
                      >
                        Limpar todas
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-zinc-900 rounded-xl">
                      {uploadedPhotos.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img
                            src={p.url}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedPhoto(p.id)}
                            className="absolute right-1 top-1 rounded-full bg-black/85 p-0.5 text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
            <button
              id="btn-cancel-new-album"
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-new-album"
              type="submit"
              className="rounded-full bg-gold-gradient px-7 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#DFBA6B]/10 hover:opacity-95 transition-opacity"
            >
              Criar e Salvar Álbum
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
