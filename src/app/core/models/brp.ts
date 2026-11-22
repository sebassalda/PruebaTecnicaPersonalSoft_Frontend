export interface Brp {
  id: number;
  codigo: string;
  estado: string;
  tipoBrp: string;
  matriculaInmobiliaria: string | null;
  placa: string | null;
  departamento: string;
  municipio: string;
  descripcion: string;
  precio: number | null;
  fechaAsignacionPrecio: string | null;
  fechaIngesta: string;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LatestIngestionResponse {
  latestIngestionDate: string | null;
}