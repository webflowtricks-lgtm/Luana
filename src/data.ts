import { Album } from "./types";

export const MOCK_STOCK_IMAGES = [
  {
    category: "Casamento",
    urls: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    category: "Retratos",
    urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    category: "Gestante / Família",
    urls: [
      "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1476703719129-6821a1619532?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const DEFAULT_ALBUMS: Album[] = [
  {
    id: "casamento-ana-pedro",
    name: "Casamento no Campo",
    clientName: "Ana & Pedro",
    description: "Ensaio de casamento realizado ao pôr do sol na fazenda colonial.",
    password: "123", // Password set to "123" for easy testing
    createdAt: "2026-06-15T14:30:00Z",
    views: 48,
    coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    photos: [
      {
        id: "p1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        name: "cerimonia_pordosol.jpg",
        size: 2450000,
        uploadedAt: "2026-06-15T14:30:00Z",
        approved: true,
        comment: "Nossa foto favorita! Ficou incrível com a luz do sol."
      },
      {
        id: "p2",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        name: "entrada_noiva.jpg",
        size: 3120000,
        uploadedAt: "2026-06-15T14:30:00Z",
        approved: true
      },
      {
        id: "p3",
        url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
        name: "votos_emocionantes.jpg",
        size: 2890000,
        uploadedAt: "2026-06-15T14:30:00Z",
        approved: false,
        comment: "Dá pra dar um zoom um pouco maior?"
      },
      {
        id: "p4",
        url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=1200&q=80",
        name: "brinde_casal.jpg",
        size: 1980000,
        uploadedAt: "2026-06-15T14:30:00Z"
      },
      {
        id: "p5",
        url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80",
        name: "danca_dos_noivos.jpg",
        size: 2240000,
        uploadedAt: "2026-06-15T14:30:00Z",
        approved: true
      }
    ]
  },
  {
    id: "ensaio-corporate-juliana",
    name: "Ensaio Corporativo",
    clientName: "Juliana Santos",
    description: "Retratos profissionais para branding pessoal e perfil de liderança.",
    password: "456", // Password set to "456" for easy testing
    createdAt: "2026-06-28T10:15:00Z",
    views: 12,
    coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    photos: [
      {
        id: "p6",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
        name: "juliana_principal.jpg",
        size: 3410000,
        uploadedAt: "2026-06-28T10:15:00Z",
        approved: true,
        comment: "Excelente para o LinkedIn!"
      },
      {
        id: "p7",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
        name: "retrato_sorrindo.jpg",
        size: 2950000,
        uploadedAt: "2026-06-28T10:15:00Z"
      },
      {
        id: "p8",
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
        name: "postura_confiante.jpg",
        size: 3100000,
        uploadedAt: "2026-06-28T10:15:00Z",
        approved: true
      },
      {
        id: "p9",
        url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80",
        name: "ambiente_trabalho.jpg",
        size: 2150000,
        uploadedAt: "2026-06-28T10:15:00Z",
        approved: false,
        comment: "Ficou um pouco desfocada ao fundo, mas gostei da cor."
      }
    ]
  },
  {
    id: "ensaio-familia-melo",
    name: "Sessão Família de Domingo",
    clientName: "Família Melo",
    description: "Sessão fotográfica descontraída de domingo no parque.",
    password: "789", // Password set to "789"
    createdAt: "2026-07-01T16:00:00Z",
    views: 5,
    coverUrl: "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=600&q=80",
    photos: [
      {
        id: "p10",
        url: "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=1200&q=80",
        name: "familia_reunida.jpg",
        size: 4120000,
        uploadedAt: "2026-07-01T16:00:00Z"
      },
      {
        id: "p11",
        url: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=1200&q=80",
        name: "criancas_brincando.jpg",
        size: 2830000,
        uploadedAt: "2026-07-01T16:00:00Z",
        approved: true
      },
      {
        id: "p12",
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        name: "abraco_coletivo.jpg",
        size: 3040000,
        uploadedAt: "2026-07-01T16:00:00Z"
      }
    ]
  }
];
