import { ImageModel } from "./images.models";

export interface SquareCreateModel {
  name: string;
  description: string;
  location: string;
  files?: File[];              // nuevas
}

export interface SquareUpdateModel extends SquareCreateModel {
  id: number;
  imagesToDelete?: string[];   // publicIds
}

export interface SquareSelectModel extends SquareUpdateModel {
  id: number;
  active: boolean;
  images: ImageModel[];
  primaryImagePath?: string | null;
}
