import { HttpInterceptor, HttpHandler } from '@angular/common/http';
import { HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/module.d-CnjH8Dlt';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { CredencialService } from './credencial.service';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(
    private tokenService: CredencialService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.tokenService.getToken();

    if (token) {
      
      authReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token)

      });
    }

  return next.handle(authReq).pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('usuarioCompleto');

      // Redirigir al login
      this.router.navigate(['/login'], {
        queryParams: { expirado: '1' } // Puedes leer esto en el componente
      });
    }

    return throwError(() => error);
  })
);
  }
}
