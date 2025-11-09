/** Imagen que el API devuelve en la salida. */
export interface ImageModel {
  id: number;
  fileName: string;
  filePath: string;
  publicId: string;

  // polimórfico
  entityType: string;  // "Establishment" | "Plaza" | ...
  entityId: number;
}
