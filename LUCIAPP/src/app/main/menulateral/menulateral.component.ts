import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
@Component({
  selector: 'app-menulateral',
  templateUrl: './menulateral.component.html',
  styleUrls: ['./menulateral.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class MenulateralComponent  implements OnInit {
private touchStartX = 0;
  private touchEndX = 0;
 nombreCompleto: string = '';
  usuario: string = '';
  private suscripcionUsuario!: Subscription;

  constructor(private actualizarService: ActualizarnombreService,private renderer: Renderer2, private el: ElementRef) {}
ngOnDestroy() {
  if (this.suscripcionUsuario) {
    this.suscripcionUsuario.unsubscribe();
  }
}
isDarkMode = false;

toggleTheme() {
  this.isDarkMode = !this.isDarkMode;

  if (this.isDarkMode) {
    document.documentElement.classList.add('dark');  
  } else {
    document.documentElement.classList.remove('dark'); 
  }
}
  ngOnInit() {
  // Cargar por primera vez
  this.cargarUsuario();

  // Escuchar cambios desde el servicio
  this.suscripcionUsuario = this.actualizarService.usuarioActualizado$
    .subscribe(() => {
      console.log('Cambio detectado, recargando usuario...');
      this.cargarUsuario();
    });

  // Lógica de swipe y clic fuera del menú
  const sidebarElement = this.el.nativeElement.querySelector('#sidebar');
  this.renderer.listen(sidebarElement, 'touchstart', (e: TouchEvent) => {
    this.touchStartX = e.changedTouches[0].screenX;
  });
  this.renderer.listen(sidebarElement, 'touchend', (e: TouchEvent) => {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  });
  this.renderer.listen('document', 'click', (event: MouseEvent) => {
    if (
      sidebarElement &&
      !sidebarElement.contains(event.target as Node) &&
      !document.getElementById('menuButton')?.contains(event.target as Node)
    ) {
      this.closeSidebar();
    }
  });
}



cargarUsuario() {
    const usuarioStr = localStorage.getItem('usuarioCompleto');
    if (usuarioStr) {
      const usuarioObj = JSON.parse(usuarioStr);
      console.log('Usuario completo recuperado:', usuarioObj);

      this.usuario = usuarioObj.usuario;
      this.nombreCompleto = usuarioObj.nombreCompleto || 'Sin Nombre';
    } else {
      console.log('No se encontró usuarioCompleto en localStorage');
      this.usuario = '';
      this.nombreCompleto = '';
    }
  }

  cerrarSesion() {
    localStorage.clear();  // Limpia todo localStorage
    this.usuario = '';
    location.reload();
    this.nombreCompleto = '';
  }




  private handleSwipe() {
    const diffX = this.touchEndX - this.touchStartX;
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance) {
      this.closeSidebar();
    }
  }

  private closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const button = document.getElementById('menuButton');
    if (sidebar && button) {
      sidebar.classList.add('translate-x-full');
      button.classList.remove('hidden');
    }
  }
}