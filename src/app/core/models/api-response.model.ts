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
export type TipoDocumento = 'DNI_FRENTE' | 'DNI_DORSO' | 'TITULO' | 'FOTO_CARNET';

export interface DocumentoResumen {
  id: number;
  preinscripcionId: number;
  tipo: TipoDocumento;
  nombreArchivo: string;
  contentType: string;
  estado: EstadoDocumento;
}
