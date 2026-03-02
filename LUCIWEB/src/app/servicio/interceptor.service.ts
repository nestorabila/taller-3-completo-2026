import { HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { CredencialService } from './credencial.service';

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
    const code = error.status;

    if (code === 401) {
      // Logout si no autorizado
      localStorage.removeItem('token');
      this.router.navigate(['luciweb/login']);
    } 
    else if ([403,404].includes(code)) {
      // Solo redirigir al componente de error si es 403, 404 o 500
      this.router.navigate(['/error'], { queryParams: { code: code.toString() } });
    } 
    // Para 400 y otros códigos no hacemos nada especial
    return throwError(() => error);
  })
);

  }
}
