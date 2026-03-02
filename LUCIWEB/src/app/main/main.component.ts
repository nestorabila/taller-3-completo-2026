import { AfterViewInit, Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CabeceraComponent } from './cabecera/cabecera.component';

@Component({
    selector: 'app-main',
    imports: [ RouterModule, CommonModule, ReactiveFormsModule, FormsModule,
      CabeceraComponent
    ],
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent {
    menuCollapsed = false;
    
 rolUsuario: string = '';
 esAdmin(): boolean {
    return this.rolUsuario === 'Administrador';
  }

  esResponsableVentas(): boolean {
    return this.rolUsuario === 'Responsable_ventas';
  }
  ngOnInit() {
    this.checkScreenSize(); 
      this.rolUsuario = localStorage.getItem('rol') || '';
  }

  // Detecta cambios de tamaño de ventana
  @HostListener('window:resize', [])
  onWindowResize() {
    this.checkScreenSize();
  }

  // Si pantalla es pequeña, colapsa menú
  checkScreenSize() {
    if (window.innerWidth < 768) {
      this.menuCollapsed = true;
    }
  }
collapseMenuIfSmallScreen() {
  if (window.innerWidth < 768) {
    this.menuCollapsed = true;
  }
}

  toggleMenu() {
    this.menuCollapsed = !this.menuCollapsed;
  }

  // Maneja clics en el contenedor cabecera
  handleContainerClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;

    console.log('Clic fuera del botón pero dentro del cabecera — no hace nada');
  }
}