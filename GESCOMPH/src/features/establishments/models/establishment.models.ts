import { ImageModel } from "./images.models";


export interface GetAllOptions {
  activeOnly?: boolean;
  limit?: number;
}

export interface EstablishmentSelect {
  id: number;
  name: string;
  description: string;
  areaM2: number;
  rentValueBase: number;
  uvtQty: number;
  address: string;
  plazaId: number;
  plazaName: string;
  active: boolean;

  /** opcional, depende si tu API incluye las imágenes en /api/establishments/{id} */
  images?: ImageModel[];
}


// DTO liviano para listados (API /Establishments/cards)
export interface EstablishmentCard {
  id: number;
  name: string;
  address: string;
  areaM2: number;
  rentValueBase: number;
  active: boolean;
  primaryImagePath?: string | null;
  description?: string;
}

export interface EstablishmentCreate {
  name: string;
  description: string;
  areaM2: number;
  uvtQty: number;
  plazaId: number;
  address?: string;

  /** nuevas imágenes subidas desde el front */
  files?: File[];
}


/**
 * Cuando se actualiza, se puede enviar:
 *  - imágenes nuevas (`images` – File[])
 *  - publicIds a borrar (`imagesToDelete`)
 */
export interface EstablishmentUpdate {
  id: number;
  name?: string;
  description?: string;
  areaM2?: number;
  rentValueBase?: number;
  uvtQty?: number;
  plazaId?: number;
  address?: string;

  /** nuevas imágenes */
  images?: File[];

  /** publicIds de las imágenes existentes a eliminar */
  imagesToDelete?: string[];
}


export type PreviewData = {
  sources: string[];
  index: number;
  title?: string;
};

