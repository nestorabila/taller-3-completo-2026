import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Credencial } from 'src/app/model/credencial';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
import { CredencialService } from 'src/app/servicio/credencial.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
   standalone: true,
  imports: [CommonModule, RouterModule,  FormsModule],
})
export class LoginComponent  {

   credencial: Credencial = {
    usuario: '',
    contrasena: ''
  };

  mensaje: string = '';
  exito: boolean | null = null;


  constructor(private actualizarService: ActualizarnombreService, private credencialService: CredencialService, private router: Router) {}

  mostrarMensaje(msg: string, exito: boolean) {
  this.mensaje = msg;
  this.exito = exito;

  // Oculta el mensaje después de 3 segundos
  setTimeout(() => {
    this.mensaje = '';
    this.exito = null;
  }, 3000); // 3000 ms = 3 segundos
}
  cargando: boolean = false;  
 iniciarSesion() {
    if (!this.credencial.usuario || !this.credencial.contrasena) {
       this.mostrarMensaje('Ingrese su usuario y contraseña', false);
      this.exito = false;
      return;
    }
   this.cargando = true;
    this.credencialService.iniciarSesion(this.credencial.usuario, this.credencial.contrasena)
      .subscribe({
        next: (res) => {
           this.cargando = false; 
          console.log('ROL del usuario:', res.rol?.idrol);
  
          if (res.estado === 0) {
            this.exito = false;
            this.mostrarMensaje('Sus credenciales han sido bloqueadas. No puede acceder.', false);
            return;
          }
  
          if (res.rol === 'Cliente') {
            this.exito = true;
            localStorage.setItem('token', res.token);
            localStorage.setItem('idpersona', res.idpersona);
            localStorage.setItem('usuarioCompleto', JSON.stringify(res));
            this.actualizarService.notificarCambio();
            this.router.navigate(['/main/perfil']);
           
          } else {
            this.exito = false;
            this.mostrarMensaje('Lo siento no tienes permisos.', false);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.exito = false;
           this.mostrarMensaje('Usuario o contraseña Incorrecto', false);
          console.error('Error en login:', err); 
        }
      });
  }



}
