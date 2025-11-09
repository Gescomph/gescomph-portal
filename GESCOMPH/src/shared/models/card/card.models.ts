import { ImageModel } from "../../../features/establishments/models/images.models";


export interface CardResource {
  id: number;
  name: string;

  // descripción opcional
  description?: string;

  // establishments
  address?: string;
  areaM2?: number;
  rentValueBase?: number;
  active?: boolean;

  // plazas
  location?: string;

  // imágenes
  primaryImagePath?: string | null;
  images?: ImageModel[] | null;
}
