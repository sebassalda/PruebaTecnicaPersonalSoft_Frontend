export interface OfferSummary {
  id: number;
  brpId: number;
  brpCodigo: string;
  valorOferta: number;
  porcentajeDescuento: number;
  estado: string;
  radicadorId: number;
  analistaId: number | null;
  fechaRadicacion: string;
}

export interface OfferPayment {
  id: number;
  tipoPago: string;
  valor: number;
  fechaPago: string;
  entidadFinanciera: string | null;
}

export interface OfferApplicant {
  id: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombre: string;
  porcentajeParticipacion: number;
  email: string | null;
  telefono: string | null;
  pagos: OfferPayment[];
}

export interface OfferDetail extends OfferSummary {
  fechaActualizacion: string;
  fechaEscalamiento: string | null;
  fechaDevolucion: string | null;
  fechaFinalizacion: string | null;
  oferentes: OfferApplicant[];
}