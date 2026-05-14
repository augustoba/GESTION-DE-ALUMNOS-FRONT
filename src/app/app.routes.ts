import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'preinscripcion',
    loadComponent: () =>
      import('./features/preinscripcion/form/preinscripcion-form.component').then(
        m => m.PreinscripcionFormComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () =>
          import('./features/admin/lista/admin-lista.component').then(m => m.AdminListaComponent)
      },
      {
        path: 'revision/:id',
        loadComponent: () =>
          import('./features/admin/revision/admin-revision.component').then(m => m.AdminRevisionComponent)
      }
    ]
  }
];
