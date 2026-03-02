import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CabeceraComponent } from '../cabecera/cabecera.component';
import { MenulateralComponent } from '../menulateral/menulateral.component';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Catalogo } from 'src/app/model/catalogo';
import { Tipo } from 'src/app/model/tipo';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CarritoService } from 'src/app/servicio/carrito.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ProgressSpinnerModule, FormsModule],
  styleUrls: ['./catalogo.component.scss'],
})
export class CatalogoComponent  implements OnInit {
 isHeaderVisible = true;
  private lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;

    if (currentScroll > this.lastScrollTop) {
      // desplazando hacia abajo → ocultar header
      this.isHeaderVisible = false;
    } else {
      // desplazando hacia arriba → mostrar header
      this.isHeaderVisible = true;
    }

    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
  
  listaCatalogo: Catalogo[]=[];
  listaCatalogoNovedad: Catalogo[]=[];
  listaCategoria: Tipo[]=[];

ip = window.location.hostname;
  constructor(private carritoService: CarritoService,  private serviceCatalogo: CatalogoService) {}

  listaVendido: Catalogo[]=[];
modelVendido() {
   this.loading = true;
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaVendido = fall
  .filter(x => x.estado === 1)
  .filter((x, i) => i % 2 === 1)  // ← impares
  .slice(0, 8);                   // ← solo 8

     this.loading = false;
  });
}
loading: boolean = false;
modelCatalogo() {
 
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall
      .filter(x =>x.estado === 1)
      .sort((a, b) => b.idcatalogo - a.idcatalogo);
    
  });
}
doRefresh(event: any) {
 this.modelVendido();
  this.modelCatalogo();
  this.modelCatalogoDestacado();
  this.modelCategoria();
  setTimeout(() => {
    event.target.complete();
  }, 1000);
}

modelCatalogoDestacado() {
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogoNovedad = fall
      .filter(x => x.destacado === 1 && x.estado === 1)
      .sort((a, b) => b.idcatalogo - a.idcatalogo);
  });
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


modelCategoria() {
  this.serviceCatalogo.ListarCategoria().subscribe((fall) => {
    this.listaCategoria = fall.filter(p => p.estado === 1);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
  });
}
filtro: number | string = 'todos';
FiltrarCatalogoCategoria() {
  if (this.filtro === 'todos') {
    this.modelCatalogo();
  } else {
    const tipo = Number(this.filtro);
    this.serviceCatalogo.filtrarPorTipo(tipo).subscribe(data => {
      this.listaCatalogo = data;
    });
  }
}
ngOnInit(): void {
   this.modelCatalogo();
   this.modelCatalogoDestacado();
   this.modelCategoria();
   this.modelVendido();
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
                  `Hola, estoy interesado/a en este catalogo ¿Podrías brindarme más información?`;

  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;

  window.open(urlWhatsApp, '_blank');
}


}