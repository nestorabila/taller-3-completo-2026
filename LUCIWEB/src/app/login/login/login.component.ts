import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Credencial } from 'src/app/model/credencial';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { AfterViewInit } from '@angular/core';
import { Catalogo } from 'src/app/model/catalogo';
import { CatalogoService } from 'src/app/servicio/catalogo.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent  {
isDarkMode = false;



initTheme() {
  const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;

  this.isDarkMode = isDarkSystem;

  if (this.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

toggleTheme() {
  this.isDarkMode = !this.isDarkMode;

  if (this.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

 mostrarMensaje = false;
desapareciendo = false;
 private _mensajeHideTimeout: any = null;
 private _mensajeRemoveTimeout: any = null;

mostrarAlerta(texto: string, tipo: 'success' | 'error') {
  this.mensaje = texto;
  this.tipoMensaje = tipo;
  this.mostrarMensaje = true;
  this.desapareciendo = false;
  // Limpiar timeouts previos si existen
  if (this._mensajeHideTimeout) {
    clearTimeout(this._mensajeHideTimeout);
    this._mensajeHideTimeout = null;
  }
  if (this._mensajeRemoveTimeout) {
    clearTimeout(this._mensajeRemoveTimeout);
    this._mensajeRemoveTimeout = null;
  }

  // Después de ~2.5s iniciar la transición de salida
  this._mensajeHideTimeout = setTimeout(() => {
    this.desapareciendo = true;
  }, 2500);

  // Después de ~3s ocultar definitivamente
  this._mensajeRemoveTimeout = setTimeout(() => {
    this.mostrarMensaje = false;
    this.desapareciendo = false;
    this.mensaje = '';
    this.tipoMensaje = '';
  }, 3000);
}

    // Referencia al elemento sidebar en el DOM
  @ViewChild('sidebar') sidebar!: ElementRef<HTMLElement>;

   toggleSidebar() {
    console.log('toggleSidebar called');

    if (!this.sidebar) {
      console.log('sidebar ElementRef is undefined or not yet available');
      return;
    }

    const sidebarEl = this.sidebar.nativeElement;
  

    sidebarEl.classList.toggle('-translate-x-full');
    sidebarEl.classList.toggle('translate-x-0');

  }



  cargando: boolean = false;

  credenciales: Credencial = {
    usuario: '',
    contrasena: '',
  

  };
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(private router: Router, private credencialService: CredencialService, private serviceCatalogo: CatalogoService,) { }

ingresar() {
  this.cargando = true;
  this.mensaje = '';

  this.credencialService.iniciarSesion(this.credenciales.usuario, this.credenciales.contrasena).subscribe({
    next: (response) => {
      this.cargando = false;
     
      if (response && response.token) {
        const rol = response.rol;
        const estado = response.estado;
      

        if (estado === 0) {
          this.mostrarAlerta('Su cuenta fue bloqueada. No puede acceder.', 'error');
          return;
        }

        if (rol === 'Administrador' || rol === 'Responsable_ventas') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('usuario', response.usuario);
          localStorage.setItem('rol', rol);
          localStorage.setItem('nombreCompleto', response.nombreCompleto);
          localStorage.setItem('correo', response.correo);
          localStorage.setItem('idpersona', response.idpersona);

          setTimeout(() => {
            this.router.navigate(['/luciweb']);
          });
        } else {
          this.mostrarAlerta('Acceso denegado: Rol no autorizado para la plataforma web.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('rol');
        }
      } else {
        this.mostrarAlerta('Respuesta sin token válido', 'error');
      }
    },
    error: (error) => {
      this.cargando = false;
      
      if (error.status === 401) {
        this.mostrarAlerta('Usuario o contraseña incorrecto, intentalo otra vez', 'error');
      } else if (error.status === 403) {
        this.mostrarAlerta('Cuenta deshabilitada', 'error');
      } else {
        this.mostrarAlerta('Ocurrió un error. Por favor, intenta de nuevo.', 'error');
      }
    }
  });
}

// listar catalog
  listaCatalogoTodos: Catalogo[]=[];
  listaCatalogoDestacado: Catalogo[]=[];
    loading: boolean = false;
    limiteCatalogos: number = 8;
modelCatalogodestacado() {
  this.loading = true;
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogoDestacado = fall
      .filter(item => item.destacado == 1)
      .filter(item => item.estado == 1)
      .sort((a, b) => b.idcatalogo - a.idcatalogo);
    this.loading = false;
  });
}

modelCatalogotodos() {
  this.loading= true
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogoTodos = fall
    .sort((a, b) => b.idcatalogo - a.idcatalogo)
    .filter(item => item.estado == 1);  
    this.loading= false
  });
}
// buscar catalogo
  filtro: string = ''; 
  buscarCatalogo() {
  if (this.filtro.trim()) {
    this.serviceCatalogo.buscarCatalogo(this.filtro).subscribe((result) => {
      this.listaCatalogoTodos = result;
    });
  } else {
    this.modelCatalogotodos(); 
  }
}
verMasCatalogos() {
  this.limiteCatalogos += 8;
}
ngOnInit(): void {
   this.modelCatalogodestacado();
   this.modelCatalogotodos();
   this.initTheme();
}
mostrarModalLogin: boolean = false;

abrirModalLogin() {
  this.mostrarModalLogin = true;
}

cerrarModalLogin() {
  this.mostrarModalLogin = false;
}
}