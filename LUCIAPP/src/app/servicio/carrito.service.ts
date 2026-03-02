import { Injectable } from '@angular/core';
import { CatalogoService } from './catalogo.service';
import { Carrito } from '../model/carrito';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
 private carrito: Carrito[] = [];
actualizarCarrito(nuevoCarrito: Carrito[]) {
  localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
}



  agregarProducto(producto: Carrito) {
    const existe = this.carrito.find(p => p.idcatalogo === producto.idcatalogo);
    if (existe) {
      existe.cantidad += producto.cantidad;
    } else {
      this.carrito.push(producto);
    }
  }

  obtenerCarrito(): Carrito[] {
    return this.carrito;
  }

  eliminarProducto(idcatalogo: number) {
    this.carrito = this.carrito.filter(p => p.idcatalogo !== idcatalogo);
  }

  limpiarCarrito() {
    this.carrito = [];
  }
}
