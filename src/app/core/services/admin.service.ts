import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, Preinscripcion, PreinscripcionDetalle,
  PageResponse, EstadoDocumento
} from '../models/api-response.model';

export interface RevisionRequest {
  decisiones: { documentoId: number; estado: EstadoDocumento }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getPreinscripciones(page = 0, size = 50): Observable<ApiResponse<PageResponse<Preinscripcion>>> {
    return this.http.get<ApiResponse<PageResponse<Preinscripcion>>>(
      `/api/preinscripciones?page=${page}&size=${size}`
    );
  }

  getConDocumentosPendientes(): Observable<ApiResponse<Preinscripcion[]>> {
    return this.http.get<ApiResponse<Preinscripcion[]>>('/api/preinscripciones/con-documentos-pendientes');
  }

  getConDocumentosRechazados(): Observable<ApiResponse<Preinscripcion[]>> {
    return this.http.get<ApiResponse<Preinscripcion[]>>('/api/preinscripciones/con-documentos-rechazados');
  }

  getConDocumentosFaltantes(): Observable<ApiResponse<Preinscripcion[]>> {
    return this.http.get<ApiResponse<Preinscripcion[]>>('/api/preinscripciones/con-documentos-faltantes');
  }

  getDetalle(id: number): Observable<ApiResponse<PreinscripcionDetalle>> {
    return this.http.get<ApiResponse<PreinscripcionDetalle>>(`/api/preinscripciones/${id}`);
  }

  confirmarRevision(id: number, request: RevisionRequest): Observable<ApiResponse<Preinscripcion>> {
    return this.http.put<ApiResponse<Preinscripcion>>(
      `/api/preinscripciones/${id}/confirmar-revision`, request
    );
  }

  getDocumentoBlob(documentoId: number): Observable<Blob> {
    return this.http.get(`/api/documentos/${documentoId}/descargar`, { responseType: 'blob' });
  }
}
