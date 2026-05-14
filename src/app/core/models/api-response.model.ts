export interface ApiResponse<T = unknown> {
  mensaje: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  username: string;
  rol: string;
  status: boolean | null;
}

export interface RegistroRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  password: string;
}

export interface Carrera {
  id: number;
  nombre: string;
}

export interface PerfilResponse {
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  fechaNac: string | null;
  status: boolean;
}

export type EstadoDocumento = 'PENDIENTE' | 'VALIDADO' | 'RESUBIR';
export type TipoDocumento = 'DNI_FRENTE' | 'DNI_DORSO' | 'TITULO' | 'FOTO_CARNET' | 'COMPROBANTE_PAGO';
export type EstadoPreinscripcion =
  'PENDIENTE_PAGO' | 'PAGO_VALIDADO' | 'DOCUMENTOS_COMPLETOS' | 'APROBADA' | 'EXPIRADA';

export interface DocumentoResumen {
  id: number;
  preinscripcionId: number;
  tipo: TipoDocumento;
  nombreArchivo: string;
  contentType: string;
  estado: EstadoDocumento;
}

export interface CarreraRef {
  id: number;
  nombre: string;
}

export interface Preinscripcion {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
  carrera: CarreraRef | null;
  pagoValidado: boolean | null;
  documentosCompletos: boolean | null;
  fechaCreacion: string;
  estado: EstadoPreinscripcion;
}

export interface PreinscripcionDetalle {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
  carrera: string | null;
  fechaCreacion: string;
  estado: EstadoPreinscripcion;
  pagoValidado: boolean | null;
  documentosCompletos: boolean | null;
  documentos: DocumentoResumen[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
