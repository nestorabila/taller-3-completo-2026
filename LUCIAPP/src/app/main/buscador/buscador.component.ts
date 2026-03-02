import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Catalogo } from 'src/app/model/catalogo';
import { Tipo } from 'src/app/model/tipo';
import { CarritoService } from 'src/app/servicio/carrito.service';
import { CatalogoService } from 'src/app/servicio/catalogo.service';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  standalone: true,
    imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./buscador.component.scss'],
})
export class BuscadorComponent  implements OnInit {


  listaCatalogo: Catalogo[]=[];
  listaCatalogoNovedad: Catalogo[]=[];
  listaTipo: Tipo[]=[];


  constructor(private carritoService: CarritoService,  private serviceCatalogo: CatalogoService) {}

 

loading: boolean = false;
modelCatalogo() {
  this.loading=true;
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall
      .filter(x =>x.estado === 1)
      .sort((a, b) => b.idcatalogo - a.idcatalogo);
  });
  this.loading=false;
}

  productoSeleccionado: Catalogo | null = null;

verDetalle(producto: Catalogo) {
  this.productoSeleccionado = producto;
}

volverALista() {
  this.productoSeleccionado = null;
}
 cantidad: number = 6; // Valor por defecto en múltiplos de 6
mostrarMensaje: boolean = false;

aumentarCantidad() {
  this.cantidad += 6;
}

disminuirCantidad() {
  if (this.cantidad > 6) {
    this.cantidad -= 6;
  }
}

agregarACarrito() {
  if (this.productoSeleccionado) {
    this.carritoService.agregarProducto({
      idcatalogo: this.productoSeleccionado.idcatalogo,
      nombre: this.productoSeleccionado.nombre,
      precio: this.productoSeleccionado.precio,
      cantidad: this.cantidad
    });

    // Mostrar mensaje por 4 segundos
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 4000);
  }
}
ngOnInit(): void {
   this.modelCatalogo();

}
@ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  currentIndex = 0;
  intervalId: any;

  ngAfterViewInit() {
    this.startAutoScroll();
  }

  startAutoScroll() {
    this.intervalId = setInterval(() => {
      const container = this.scrollContainer.nativeElement;
      const cards = container.querySelectorAll('div.snap-start');

      if (cards.length > 0) {
        // Avanza una tarjeta
        this.currentIndex = (this.currentIndex + 1) % cards.length;
        const card = cards[this.currentIndex] as HTMLElement;
        container.scrollTo({
          left: card.offsetLeft,
          behavior: 'smooth',
        });
      }
    }, 3000); // cada 3 segundos
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

compartirProducto() {
  const producto = this.productoSeleccionado;
  if (!producto) return;

  const mensaje = `📦 *${producto.nombre}*\n` +
                  `📄 ${producto.descripcion}\n` +
                  `💰 Precio: ${producto.precio} Bs.\n` +
                  `✨ Creaciones Lucianita te ofrece lo mejor para tus momentos especiales ✨`;

  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/?text=${mensajeCodificado}`;

  window.open(urlWhatsApp, '_blank');
}

compartirPorWhatsappDirecto() {
  const producto = this.productoSeleccionado;
  if (!producto) return;

  const numero = '59172448749'; // 591 es el código de Bolivia

  const mensaje = `📦 *${producto.nombre}*\n` +
                  `📄 ${producto.descripcion}\n` +
                  `💰 Precio: ${producto.precio} Bs.\n\n` +
                  `Hola, estoy interesado/a en este producto. ¿Está disponible?`;

  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;

  window.open(urlWhatsApp, '_blank');
}



  // buscar catalogo
  filtro: string = ''; 
  buscarCatalogo() {
  if (this.filtro.trim()) {
    this.serviceCatalogo.buscarCatalogo(this.filtro).subscribe((result) => {
      this.listaCatalogo = result;
    });
  } else {
    this.modelCatalogo(); 
  }
}

ip = window.location.hostname;


}
