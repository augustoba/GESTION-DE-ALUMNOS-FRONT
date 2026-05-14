import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PreinscripcionService } from '../../core/services/preinscripcion.service';
import { DocumentoResumen, PerfilResponse } from '../../core/models/api-response.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

export type Section = 'inicio' | 'materias' | 'documentos' | 'perfil';

export interface Materia {
  nombre: string;
  año: number;
  condicion: 'Regular' | 'Libre' | 'Cursando' | 'Promocionado';
  notas: number[];
  asistencia: number;
}

const MATERIAS: Materia[] = [
  { nombre: 'Matemática Discreta',              año: 1, condicion: 'Regular',     notas: [6, 7, 7],     asistencia: 82 },
  { nombre: 'Algoritmos y Estructuras de Datos', año: 1, condicion: 'Regular',    notas: [8, 9, 9],     asistencia: 91 },
  { nombre: 'Inglés Técnico I',                 año: 1, condicion: 'Libre',       notas: [3, 4],        asistencia: 48 },
  { nombre: 'Arquitectura de Computadoras',     año: 1, condicion: 'Promocionado', notas: [9, 9, 10],   asistencia: 96 },
  { nombre: 'Análisis de Sistemas I',           año: 1, condicion: 'Regular',     notas: [7, 8],        asistencia: 80 },
  { nombre: 'Programación I',                   año: 1, condicion: 'Cursando',    notas: [],            asistencia: 75 },
  { nombre: 'Base de Datos I',                  año: 2, condicion: 'Cursando',    notas: [],            asistencia: 88 },
];

@Component({
  selector: 'app-dashboard',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    DecimalPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService      = inject(AuthService);
  private preinscService   = inject(PreinscripcionService);
  private dialog           = inject(MatDialog);
  private fb               = inject(FormBuilder);
  private _fotoUrl: string | null = null;

  activeSection  = signal<Section>('inicio');
  perfil         = signal<PerfilResponse | null>(null);
  documentos     = signal<DocumentoResumen[]>([]);
  loadingDocs    = signal(false);
  subiendoId     = signal<number | null>(null);
  fotoCarnetUrl  = signal<string | null>(null);
  editandoPerfil = signal(false);
  guardandoPerfil = signal(false);
  materias       = MATERIAS;

  perfilForm = this.fb.group({
    direccion: [''],
    telefono:  ['']
  });

  readonly anios = [1, 2];

  readonly navItems: { section: Section; icon: string; label: string }[] = [
    { section: 'inicio',      icon: 'home',          label: 'Inicio'         },
    { section: 'materias',    icon: 'school',        label: 'Mis Materias'   },
    { section: 'documentos',  icon: 'folder_open',   label: 'Documentos'     },
    { section: 'perfil',      icon: 'person',        label: 'Mi Perfil'      },
  ];

  /* ── computed stats ──────────────────────────────── */
  regulares   = computed(() => this.materias.filter(m => m.condicion === 'Regular').length);
  libres      = computed(() => this.materias.filter(m => m.condicion === 'Libre').length);
  promAsist   = computed(() => {
    const vals = this.materias.map(m => m.asistencia);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  docsValidados = computed(() =>
    this.documentos().filter(d => d.estado === 'VALIDADO').length
  );

  ngOnInit(): void {
    this.preinscService.getPerfil().subscribe({
      next: res => this.perfil.set(res.data)
    });
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    if (this._fotoUrl) URL.revokeObjectURL(this._fotoUrl);
  }

  setSection(section: Section): void {
    this.activeSection.set(section);
  }

  cargarDocumentos(): void {
    this.loadingDocs.set(true);
    this.preinscService.getDocumentos().subscribe({
      next: res => {
        this.documentos.set(res.data);
        this.cargarFotoCarnet(res.data);
      },
      complete: () => this.loadingDocs.set(false)
    });
  }

  private cargarFotoCarnet(docs: DocumentoResumen[]): void {
    const foto = docs.find(d => d.tipo === 'FOTO_CARNET');
    if (!foto) return;
    this.preinscService.getDocumentoBlob(foto.id).subscribe(blob => {
      if (this._fotoUrl) URL.revokeObjectURL(this._fotoUrl);
      this._fotoUrl = URL.createObjectURL(blob);
      this.fotoCarnetUrl.set(this._fotoUrl);
    });
  }

  materiasDeAnio(año: number): Materia[] {
    return this.materias.filter(m => m.año === año);
  }

  promedio(notas: number[]): number | null {
    if (!notas.length) return null;
    return notas.reduce((a, b) => a + b, 0) / notas.length;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      DNI_FRENTE:  'DNI Frente',
      DNI_DORSO:   'DNI Dorso',
      TITULO:      'Título Secundario',
      FOTO_CARNET: 'Foto Carnet',
    };
    return map[tipo] ?? tipo;
  }

  verDocumento(doc: DocumentoResumen): void {
    this.preinscService.getDocumentoBlob(doc.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  abrirSelectorArchivo(input: HTMLInputElement): void {
    input.value = '';
    input.click();
  }

  onArchivoSeleccionado(event: Event, doc: DocumentoResumen): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titulo: '¿Reemplazar documento?',
        mensaje: `¿Está seguro que desea cambiar "${this.labelTipo(doc.tipo)}"?\n\nUna vez enviado, no podrá modificarlo nuevamente hasta que Administración lo rechace.`,
        confirmLabel: 'Sí, subir',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      this.subiendoId.set(doc.id);
      this.preinscService.resubirDocumento(doc.preinscripcionId, doc.tipo, archivo).subscribe({
        next: () => this.cargarDocumentos(),
        error: () => this.subiendoId.set(null),
        complete: () => this.subiendoId.set(null)
      });
    });
  }

  iniciarEdicion(): void {
    const p = this.perfil();
    this.perfilForm.setValue({
      direccion: p?.direccion ?? '',
      telefono:  p?.telefono  ?? ''
    });
    this.editandoPerfil.set(true);
  }

  cancelarEdicion(): void {
    this.editandoPerfil.set(false);
  }

  guardarPerfil(): void {
    const { direccion, telefono } = this.perfilForm.value;
    this.guardandoPerfil.set(true);
    this.preinscService.actualizarPerfil(direccion ?? '', telefono ?? '').subscribe({
      next: res => {
        this.perfil.set(res.data);
        this.editandoPerfil.set(false);
      },
      complete: () => this.guardandoPerfil.set(false),
      error:    () => this.guardandoPerfil.set(false)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
