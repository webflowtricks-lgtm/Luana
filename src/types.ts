export interface Photo {
  id: string;
  url: string; // Could be a default stock image or a base64 uploaded image
  name: string;
  size: number; // in bytes
  uploadedAt: string;
  approved?: boolean;
  comment?: string;
}

export interface Album {
  id: string;
  name: string;
  clientName: string;
  description: string;
  password?: string; // If set, password is required to view
  createdAt: string;
  photos: Photo[];
  views: number;
  coverUrl?: string;
  watermarkActive?: boolean;
  watermarkType?: "image" | "text" | "both";
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkSize?: string;
  watermarkImageUrl?: string;
}

export interface Stats {
  clientsCount: number;
  albumsCount: number;
  photosCount: number;
  viewsCount: number;
  storageUsed: number; // in bytes
}
