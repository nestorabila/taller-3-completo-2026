import { AfterViewInit, Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PersonaService } from 'src/app/servicio/persona.service';
import { Persona } from 'src/app/model/persona';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { Negocio } from 'src/app/model/negocio';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { PedidoService } from 'src/app/servicio/pedido.service';


@Component({
    selector: 'app-cabecera',
    imports: [
    RouterModule,
    CommonModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    CardModule,
    ProgressSpinnerModule
  ],
    templateUrl: './cabecera.component.html',
    styleUrls: ['./cabecera.component.css']
})
export class CabeceraComponent  {
     isDarkMode = false;

toggleTheme() {
  this.isDarkMode = !this.isDarkMode;

  if (this.isDarkMode) {
    document.documentElement.classList.add('dark');  
  } else {
    document.documentElement.classList.remove('dark'); 
  }
}


    constructor(private cataService: CatalogoService, private pedService: PedidoService, private libreService: NegocioService,private PerService: PersonaService, private renderer: Renderer2, private elRef: ElementRef, private router: Router) {}
notificaciones: { mensaje: string; icono?: string; fecha?: string; hora?: string }[] = [];
mostrarNotificaciones: boolean = false;

cargarNotificacionesRecientes(): void {
  const ahora = new Date();

  // PERSONAS
  this.PerService.ListarPersonas().subscribe(personas => {
    personas
      .filter(p => p.rol?.every(r => r.idrol !== 1))
      .filter(p => this.esReciente(p.fecha, ahora))
      .forEach(p => {
        this.notificaciones.push({
         mensaje: `¡Nuevo registro! ${p.rol?.[0]?.nombre || 'Sin Rol'}: ${p.nombre} ${p.ap_paterno} ${p.ap_materno}, teléfono: ${p.telefono}.`,
          fecha: this.formatearFecha(p.fecha),
          hora: p.hora || this.obtenerHoraActual(),
        });
      });
  });

  // LIBRERÍAS
  this.libreService.ListarNegocioCompleto().subscribe(librerias => {
    librerias
      .filter(l => this.esReciente(l.fecha, ahora))
      .forEach(l => {
        this.notificaciones.push({
        mensaje: `Se ha registrado una nueva librería: "${l.razon_social}", del cliente ${l.persona?.nombre}, ubicada ciudad de ${l.ciudad?.nombre}.`,
          fecha: this.formatearFecha(l.fecha),
          hora: l.hora || this.obtenerHoraActual(),
        });
      });
  });

  this.cataService.ListarCatalogo().subscribe(librerias => {
    librerias
      .filter(l => this.esReciente(l.fecha, ahora))
      .forEach(l => {
        this.notificaciones.push({
         mensaje: `Se ha añadido un nuevo catálogo: ${l.nombre}.`,
          fecha: this.formatearFecha(l.fecha),
          hora: l.hora || this.obtenerHoraActual(),
        });
      });
  });

  this.pedService.ListarPedido().subscribe(librerias => {
    librerias
      .filter(l => this.esReciente(l.fecha, ahora))
      .forEach(l => {
        this.notificaciones.push({
        mensaje: `¡Hola! hay nuevo pedido de: ${l.libreria?.persona?.nombre} ${l.libreria?.persona?.ap_paterno}.`,

          fecha: this.formatearFecha(l.fecha),
          hora: l.hora || this.obtenerHoraActual(),
        });
      });
  });
// RECORDATORIOS DE ENTREGA DE PEDIDO
this.pedService.ListarPedido().subscribe(pedidos => {
  pedidos
  .filter(pedido => [1, 2, 3].includes(pedido.estado))
  .forEach(pedido => {
    const fechaEntrega = new Date(pedido.fecha_entrega!);
    const hoy = new Date();
    const diffTiempo = fechaEntrega.getTime() - hoy.getTime();
    const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

    // Si faltan 1 día o menos, mostrar recordatorio
    if (diffDias === 1 || diffDias === 0) {
      this.notificaciones.push({
        mensaje: `Hola, te queda ${diffDias === 0 ? 'hoy' : '1 día'} para entregar el pedido de: ${pedido.libreria?.persona?.nombre} ${pedido.libreria?.persona?.ap_paterno}`,
        fecha: this.formatearFecha(pedido.fecha_entrega!),
        hora: pedido.hora || this.obtenerHoraActual(),
      });
    }
  });
});
// RECORDATORIO DE PEDIDO SIN FECHA DE ENTREGA
this.pedService.ListarPedido().subscribe(pedidos => {
  pedidos.forEach(pedido => {
    if (!pedido.fecha_entrega || pedido.fecha_entrega.toDateString() === '') {
      this.notificaciones.push({
        mensaje: `Hola, el pedido de ${pedido.libreria?.persona?.nombre} ${pedido.libreria?.persona?.ap_paterno} no tiene una fecha de entrega asignada. ¿Deseas asignarla?`,
        fecha: this.formatearFecha(pedido.fecha), // puedes poner la fecha del pedido
        hora: pedido.hora || this.obtenerHoraActual(),
      });
    }
  });
});

  // Aquí más notificaciones si quieres...
}

esReciente(fechaStr: string | Date, referencia: Date): boolean {
  const fecha = new Date(fechaStr);
  return (referencia.getTime() - fecha.getTime()) <= 24 * 60 * 60 * 1000; // últimas 24 horas
}

formatearFecha(fechaStr: string | Date): string {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

obtenerHoraActual(): string {
  const ahora = new Date();
  return ahora.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}


    ngOnInit(): void {
  this.cargarNotificacionesRecientes();

setInterval(() => {
    this.notificaciones = [];
    this.cargarNotificacionesRecientes();
  }, 60000);

      this.rolUsuario = localStorage.getItem('rol') || '';
      this.definirSaludo();
      const sidebar = this.elRef.nativeElement.querySelector('#sidebarTaller');
      this.nombreCompleto = localStorage.getItem('nombreCompleto') || 'Usuario';
      this.correo = localStorage.getItem('correo') || 'sin correo';
      this.rol = localStorage.getItem('rol') || 'Rol';
      window.addEventListener('resize', () => {
      });
    }
 saludo: string ="";
  definirSaludo() {
    const horaActual = new Date().getHours();

    if (horaActual >= 0 && horaActual < 12) {
      this.saludo = "Buenos días";
    } else if (horaActual >= 12 && horaActual < 18) {
      this.saludo = "Buenas tardes";
    } else {
      this.saludo = "Buenas noches";
    }
  }

    nombreCompleto: string = ''; 
    rol: string = '';
     correo: string = '';
    salir(){
      localStorage.removeItem('token');
      this.router.navigate(['luciweb/login']);
    };
    rolUsuario: string = '';
 esAdmin(): boolean {
    return this.rolUsuario === 'Administrador';
  }

  esResponsableVentas(): boolean {
    return this.rolUsuario === 'Responsable_ventas';
  }
menuVisible = false;

toggleMenu() {
  this.menuVisible = !this.menuVisible;
}

@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const clickedInside = (event.target as HTMLElement).closest('.menu-container');
  if (!clickedInside) {
    this.menuVisible = false;
  }
}




  }
