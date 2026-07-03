import { useState, useEffect } from "react";
import { CameraOff, ArrowLeft } from "lucide-react";
import { Album } from "./types";
import { DEFAULT_ALBUMS } from "./data";
import Dashboard from "./components/Dashboard";
import AlbumDetail from "./components/AlbumDetail";
import ClientAlbumView from "./components/ClientAlbumView";
import NewAlbumModal from "./components/NewAlbumModal";
import PhotographerAuth from "./components/PhotographerAuth";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, removeUndefined } from "./firebase";

export default function App() {
  // State for albums - load dynamically from Firestore
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "albums"),
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore database is empty, seed it with DEFAULT_ALBUMS so there is initial data
          console.log("Banco de dados do Firebase vazio. Inicializando com álbuns padrão...");
          for (const album of DEFAULT_ALBUMS) {
            try {
              await setDoc(doc(db, "albums", album.id), removeUndefined(album));
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `albums/${album.id}`);
            }
          }
        } else {
          const loadedAlbums: Album[] = [];
          snapshot.forEach((d) => {
            loadedAlbums.push(d.data() as Album);
          });
          // Sort by createdAt descending
          loadedAlbums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAlbums(loadedAlbums);
          setIsLoading(false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "albums");
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle URL deep links on load (e.g. ?album=album-123) and increment view count
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [albumNotFound, setAlbumNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const albumParam = params.get("album");
    if (albumParam && !isLoading && !hasIncrementedView) {
      const found = albums.find((a) => a.id === albumParam);
      if (found) {
        setActiveAlbumId(albumParam);
        setCurrentRole("client"); // Direct client-facing protected workspace experience!
        setHasIncrementedView(true);

        // Increment view count dynamically in Firestore
        const albumRef = doc(db, "albums", albumParam);
        updateDoc(albumRef, { views: found.views + 1 }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `albums/${albumParam}`);
        });
      } else {
        setAlbumNotFound(true);
      }
    }
  }, [albums, isLoading, hasIncrementedView]);

  // Handle creating a new album
  const handleCreateAlbum = async (albumData: Omit<Album, "id" | "createdAt" | "views">) => {
    // Generate a beautiful, clean, URL-friendly slug from the album name
    let baseSlug = albumData.name
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
      .replace(/[^\w\s-]/g, "") // remove special characters except hyphens and spaces
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/--+/g, "-") // collapse consecutive hyphens
      .trim();

    if (!baseSlug) {
      baseSlug = "album";
    }

    let id = baseSlug;
    let counter = 1;
    // Check for collisions and append -1, -2, etc. if needed
    while (albums.some((album) => album.id === id)) {
      id = `${baseSlug}-${counter}`;
      counter++;
    }

    const newAlbum: Album = {
      ...albumData,
      id,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    try {
      await setDoc(doc(db, "albums", id), removeUndefined(newAlbum));
      // Auto unlock newly created albums for the photographer session
      setUnlockedAlbums((prev) => ({ ...prev, [id]: true }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `albums/${id}`);
    }
  };

  // Handle deleting an album
  const handleDeleteAlbum = async (id: string) => {
    try {
      await deleteDoc(doc(db, "albums", id));
      if (activeAlbumId === id) {
        handleGoHome();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `albums/${id}`);
    }
  };

  // Handle returning home & clearing query parameter
  const handleGoHome = () => {
    setActiveAlbumId(null);
    setAlbumNotFound(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  // Handle selecting an album (Photographer clicks the card to manage and edit)
  const handleSelectAlbum = (id: string) => {
    setActiveAlbumId(id);
    setCurrentRole("photographer");
  };

  // Handle updating an album (e.g., photo approval or comment)
  const handleUpdateAlbum = async (updatedAlbum: Album) => {
    try {
      await setDoc(doc(db, "albums", updatedAlbum.id), removeUndefined(updatedAlbum));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `albums/${updatedAlbum.id}`);
    }
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
        {albumNotFound ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="rounded-full bg-zinc-900/80 p-6 border border-zinc-800 mb-6 shadow-lg">
              <CameraOff className="h-12 w-12 text-[#DFBA6B]" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-2">
              Álbum não encontrado
            </h2>
            <p className="text-sm text-zinc-400 max-w-md">
              O álbum que você está tentando acessar não existe ou foi removido pelo fotógrafo. Por favor, verifique o link enviado.
            </p>
          </div>
        ) : currentRole === "photographer" && !isPhotographerAuthenticated ? (
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
