import { useState, useEffect } from "react";
import { Album } from "./types";
import { DEFAULT_ALBUMS } from "./data";
import Dashboard from "./components/Dashboard";
import AlbumDetail from "./components/AlbumDetail";
import ClientAlbumView from "./components/ClientAlbumView";
import NewAlbumModal from "./components/NewAlbumModal";
import PhotographerAuth from "./components/PhotographerAuth";

export default function App() {
  // State for albums - load from localStorage or fall back to default mockup
  const [albums, setAlbums] = useState<Album[]>(() => {
    const saved = localStorage.getItem("lumiere_albums");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar álbuns do localStorage:", e);
      }
    }
    return DEFAULT_ALBUMS;
  });

  // Photographer authentication state
  const [isPhotographerAuthenticated, setIsPhotographerAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("lumiere_photographer_auth") === "true";
  });

  // Active view states
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<"photographer" | "client">("photographer");
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);

  // Keep track of which album IDs have been unlocked in the current session
  const [unlockedAlbums, setUnlockedAlbums] = useState<Record<string, boolean>>({});

  // Sync albums to local storage on changes
  useEffect(() => {
    localStorage.setItem("lumiere_albums", JSON.stringify(albums));
  }, [albums]);

  // Handle URL deep links on load (e.g. ?album=album-123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const albumParam = params.get("album");
    if (albumParam) {
      // Check if this album exists
      const found = albums.find((a) => a.id === albumParam);
      if (found) {
        setActiveAlbumId(albumParam);
        setCurrentRole("client"); // Direct client-facing protected workspace experience!
        
        // Increment view count dynamically since client visited deep link
        setAlbums((prev) =>
          prev.map((album) => {
            if (album.id === albumParam) {
              return { ...album, views: album.views + 1 };
            }
            return album;
          })
        );
      }
    }
  }, []); // Run once on mount

  // Handle creating a new album
  const handleCreateAlbum = (albumData: Omit<Album, "id" | "createdAt" | "views">) => {
    const newAlbum: Album = {
      ...albumData,
      id: "album-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      views: 0,
    };

    setAlbums((prev) => [newAlbum, ...prev]);
    
    // Auto unlock newly created albums for the photographer session
    setUnlockedAlbums((prev) => ({ ...prev, [newAlbum.id]: true }));
    
    // Friendly reminder about the password configured
    if (newAlbum.password) {
      alert(
        `Álbum "${newAlbum.name}" criado com sucesso!\n\n🔑 Senha configurada: ${newAlbum.password}\n\nVocê pode testar o bloqueio mudando para o "Modo Cliente" no topo da página!`
      );
    } else {
      alert(`Álbum "${newAlbum.name}" criado com sucesso sem restrições de senha.`);
    }
  };

  // Handle deleting an album
  const handleDeleteAlbum = (id: string) => {
    setAlbums((prev) => prev.filter((album) => album.id !== id));
    if (activeAlbumId === id) {
      handleGoHome();
    }
  };

  // Handle returning home & clearing query parameter
  const handleGoHome = () => {
    setActiveAlbumId(null);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // Handle selecting an album (Photographer clicks the card to manage and edit)
  const handleSelectAlbum = (id: string) => {
    setActiveAlbumId(id);
    setCurrentRole("photographer");
  };

  // Handle updating an album (e.g., photo approval or comment)
  const handleUpdateAlbum = (updatedAlbum: Album) => {
    setAlbums((prev) =>
      prev.map((album) => (album.id === updatedAlbum.id ? updatedAlbum : album))
    );
  };

  // Handle unlocking an album successfully
  const handleUnlockAlbum = (id: string) => {
    setUnlockedAlbums((prev) => ({ ...prev, [id]: true }));
  };

  const handleAuthenticatePhotographer = () => {
    setIsPhotographerAuthenticated(true);
    sessionStorage.setItem("lumiere_photographer_auth", "true");
  };

  const activeAlbum = albums.find((a) => a.id === activeAlbumId);

  return (
    <div id="app-wrapper" className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col">
      {/* Main Container */}
      <main id="main-content" className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentRole === "photographer" && !isPhotographerAuthenticated ? (
          <PhotographerAuth onAuthenticate={handleAuthenticatePhotographer} />
        ) : activeAlbumId && activeAlbum ? (
          currentRole === "client" ? (
            <ClientAlbumView
              album={activeAlbum}
              onBack={handleGoHome}
              onUpdateAlbum={handleUpdateAlbum}
              onUnlockAlbum={handleUnlockAlbum}
            />
          ) : (
            <AlbumDetail
              album={activeAlbum}
              onBack={handleGoHome}
              onUpdateAlbum={handleUpdateAlbum}
              isUnlockedInitially={!!unlockedAlbums[activeAlbumId]}
              onUnlockAlbum={handleUnlockAlbum}
              viewRole={currentRole}
            />
          )
        ) : (
          <Dashboard
            albums={albums}
            onSelectAlbum={handleSelectAlbum}
            onNewAlbumClick={() => setIsNewAlbumModalOpen(true)}
            onDeleteAlbum={handleDeleteAlbum}
          />
        )}
      </main>

      {/* Footer */}
      <footer id="app-footer" className="border-t border-zinc-900 bg-[#080808]/80 py-6 text-center text-xs text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p id="footer-text">
            © 2026 Luana Santos Fotografia. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* New Album Creation Modal */}
      <NewAlbumModal
        isOpen={isNewAlbumModalOpen}
        onClose={() => setIsNewAlbumModalOpen(false)}
        onSave={handleCreateAlbum}
      />
    </div>
  );
}
