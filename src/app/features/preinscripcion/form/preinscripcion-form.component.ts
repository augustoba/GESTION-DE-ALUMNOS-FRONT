import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { PreinscripcionService } from '../../../core/services/preinscripcion.service';
import { AuthService } from '../../../core/services/auth.service';
import { Carrera } from '../../../core/models/api-response.model';

interface FileEntry {
  file: File | null;
  error: string;
}

@Component({
  selector: 'app-preinscripcion-form',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './preinscripcion-form.component.html',
  styleUrl: './preinscripcion-form.component.scss'
})
export class PreinscripcionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private preinscripcionService = inject(PreinscripcionService);
  private authService = inject(AuthService);

  loading = signal(false);
  loadingDatos = signal(true);
  error = signal('');
  success = signal(false);

  carreras = signal<Carrera[]>([]);
  username = this.authService.getUsername();

  // Campos bloqueados porque ya vienen del registro
  readonly camposBloqueados = new Set(['nombre', 'apellido', 'dni', 'email']);

  files: Record<string, FileEntry> = {
    comprobante: { file: null, error: '' },
    dniFente:    { file: null, error: '' },
    dniDorso:    { file: null, error: '' },
    titulo:      { file: null, error: '' },
    fotoCarnet:  { file: null, error: '' }
  };

  form = this.fb.group({
    nombre:          [{ value: '', disabled: true }, Validators.required],
    apellido:        [{ value: '', disabled: true }, Validators.required],
    dni:             [{ value: '', disabled: true }, Validators.required],
    email:           [{ value: '', disabled: true }, Validators.required],
    telefono:        ['', Validators.required],
    direccion:       ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    carreraId:       [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    forkJoin({
      perfil:   this.preinscripcionService.getPerfil(),
      carreras: this.preinscripcionService.getCarreras()
    }).subscribe({
      next: ({ perfil, carreras }) => {
        const p = perfil.data;
        this.form.patchValue({
          nombre:          p.nombres,
          apellido:        p.apellidos,
          dni:             p.dni,
          email:           p.email,
          direccion:       p.direccion ?? '',
          fechaNacimiento: p.fechaNac ?? ''
        });
        this.carreras.set(carreras.data);
      },
      error: () => this.error.set('No se pudo cargar tu información. Recargá la página.'),
      complete: () => this.loadingDatos.set(false)
    });
  }

  onFileChange(event: Event, key: string): void {
    const input = event.target as HTMLInputElement;
    this.files[key] = { file: input.files?.[0] ?? null, error: '' };
  }

  private allFilesSelected(): boolean {
    let valid = true;
    for (const key of Object.keys(this.files)) {
      if (!this.files[key].file) {
        this.files[key] = { file: null, error: 'Este documento es requerido' };
        valid = false;
      }
    }
    return valid;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.allFilesSelected()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('nombre',          v.nombre!);
    fd.append('apellido',        v.apellido!);
    fd.append('dni',             v.dni!);
    fd.append('email',           v.email!);
    fd.append('telefono',        v.telefono!);
    fd.append('direccion',       v.direccion!);
    fd.append('fechaNacimiento', v.fechaNacimiento!);
    fd.append('carreraId',       String(v.carreraId!));
    fd.append('comprobante',     this.files['comprobante'].file!);
    fd.append('dniFente',        this.files['dniFente'].file!);
    fd.append('dniDorso',        this.files['dniDorso'].file!);
    fd.append('titulo',          this.files['titulo'].file!);
    fd.append('fotoCarnet',      this.files['fotoCarnet'].file!);

    this.preinscripcionService.crear(fd).subscribe({
      next: () => this.success.set(true),
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al enviar. Intentá de nuevo.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
