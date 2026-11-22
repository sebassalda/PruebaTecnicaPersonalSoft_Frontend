export interface PaymentRequest {
  tipoPago: string;
  valor: number;
  fechaPago: string;
  entidadFinanciera: string | null;
}

export interface ApplicantRequest {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  nombre: string;
  porcentajeParticipacion: number;
  email: string | null;
  telefono: string | null;
  pagos: PaymentRequest[];
}

export interface OfferRegistrationRequest {
  brpId: number;
  valorOferta: number;
  oferentes: ApplicantRequest[];
}