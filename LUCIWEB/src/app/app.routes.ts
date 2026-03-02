import { Routes } from '@angular/router';
import { LoginComponent } from './login/login/login.component';
import { MainComponent } from './main/main.component';
import { MainRoutes } from './main/main.routes';
import { authGuard } from './servicio/auth.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'luciweb/login', pathMatch: 'full' },
  {
    path: 'luciweb/login',
    loadComponent: () =>
      import('./login/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'luciweb/error',
    loadComponent: () =>
      import('./main/error/error.component').then(m => m.ErrorComponent)
  },
  {
    path: 'luciweb',
    loadComponent: () =>
      import('./main/main.component').then(m => m.MainComponent),
    canActivate: [authGuard], 
    children: [...MainRoutes]
  },
 { path: '**', redirectTo: '/luciweb/error', pathMatch: 'full' }

];


