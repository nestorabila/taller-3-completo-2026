import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ActualizarnombreService {
  private usuarioActualizado = new BehaviorSubject<boolean>(false);

  // Observable al que otros componentes pueden suscribirse
  usuarioActualizado$ = this.usuarioActualizado.asObservable();

  // Método para emitir evento
  notificarCambio() {
    this.usuarioActualizado.next(true);
  }
}
