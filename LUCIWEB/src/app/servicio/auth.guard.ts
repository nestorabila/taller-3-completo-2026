import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CredencialService } from './credencial.service';
 // ajusta si está en otra carpeta

export const authGuard: CanActivateFn = (route, state) => {
  const credencialService = inject(CredencialService);
  const router = inject(Router);

  const token = credencialService.getToken();

  if (!token) {
    router.navigate(['/luciweb/login']);
    
    return false;
  }

  // Obtener rol del usuario
  const userRole = credencialService.getRol(); // O leer de localStorage, según implementación

  // Obtener roles permitidos para esta ruta
  const rolesPermitidos: string[] = route.data['roles'];

  if (rolesPermitidos && !rolesPermitidos.includes(userRole!)) {
    
    router.navigate(['/luciweb/error'], { queryParams: { code: '403' } });
    return false;
  }

  return true;
};
