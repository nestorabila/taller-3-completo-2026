import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
 code: string | null = null;
  message: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.code = params.get('code');
      this.setErrorMessage(this.code);
    });
  }

  setErrorMessage(code: string | null): void {
    switch (code) {
      case '403':
        this.message = ' Acceso denegado. No tienes permiso para ver este recurso.';
        break;
      case '404':
        this.message = 'Recurso no encontrado.';
        break;
      case '500':
        this.message = 'Error interno del servidor. Intenta más tarde.';
        break;
      default:
        this.message = 'Ocurrió un error inesperado.';
        break;
    }
  }

}
