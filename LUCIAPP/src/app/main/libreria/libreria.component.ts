import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ciudad } from 'src/app/model/ciudad';
import { Credencial } from 'src/app/model/credencial';
import { Departamento } from 'src/app/model/departamento';
import { Negocio } from 'src/app/model/negocio';
import { Persona } from 'src/app/model/persona';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
import { CiudadService } from 'src/app/servicio/ciudad.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { RolService } from 'src/app/servicio/rol.service';

@Component({
  selector: 'app-libreria',
  templateUrl: './libreria.component.html',
  styleUrls: ['./libreria.component.scss'],
   standalone: true,
  imports: [CommonModule, RouterModule,ReactiveFormsModule, FormsModule],
})
export class LibreriaComponent  implements OnInit {

 mostrarFormulario: boolean = false;
listaCiudad: Ciudad[] =[];
listaDepartamento: Departamento[] =[];
listaPersona: Persona[] = [];
listaNegocio: Negocio[]=[];
  negocioForm: any = new FormGroup({
    idlibreria: new FormControl(''),
     razon_social: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/)
  ]),
  nit: new FormControl('', [
    Validators.minLength(5),
    Validators.maxLength(20),
    Validators.pattern(/^[\+\-]?[0-9\-]+$/)
  ]),
  telefono: new FormControl('', [
    Validators.minLength(7),
    Validators.maxLength(20),
    Validators.pattern(/^[\+\-]?[0-9\-]+$/)
  ]),
    hora: new FormControl(''),
    persona_registrado: new FormControl(''),
    direccion: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(255)
  ]),
    fecha: new FormControl(''),
    persona: new FormControl(''),
    ciudad: new FormControl('', Validators.required),
  
  })
 constructor(private actualizarService: ActualizarnombreService, private credencialService: CredencialService,
    private PerService: PersonaService,private cuidadService: CiudadService, private credeService: CredencialService,
     private rolService: RolService, private libreService: NegocioService, private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }
modelPersona() {
  this.PerService.ListarPersonas().subscribe((fall) => {
    this.listaPersona = fall.filter(p => p.estado === 1 && p.rol?.idrol === 2);
  });
}
loading: boolean = false;
modelNegocio() {
  this.loading=true;
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const id = usuario?.idpersona;

  if (id) {
    this.libreService.ListarNegocio(id).subscribe((fall) => {
      this.listaNegocio = fall; // Ya está filtrado desde el backend
      const negocio = this.listaNegocio[0]; // Solo debería haber uno
      if (negocio) {
        this.vistaNegocio(negocio); // Carga datos al formulario
      }
    });
    this.loading=false;
  }
}


modelDepartamento() {
  this.cuidadService.ListarDep().subscribe((res) => {
    console.log('Lista de dep recibida:', res);
    this.listaDepartamento = res;
  });
}
 modelCiudad() {
   this.cuidadService.ListarCuidad().subscribe((res) => {
    this.listaCiudad = res;
    this.modelNegocio();
  });
}

mostrarLogin: boolean = false;
  ngOnInit(): void {
      const token = localStorage.getItem('token');

  if (!token) {
    this.mostrarLogin = true;
    return;
  }
    this.modelPersona();
    this.modelNegocio();
    this.modelCiudad();
    this.modelDepartamento();
}

  radioSeleccionado: boolean = false;
  Obtenercliente!: Persona;
  vista(fall: Persona) {
    this.Obtenercliente = fall; 
    this.radioSeleccionado = true;
    this.modelNegocio(); 
  }
  xper!: any;
 

// modificar negocio

vistaNegocio(xdat: Negocio) { 
  const Seleccionada = this.listaCiudad.find(c => c.idciudad === xdat.ciudad?.idciudad) || null;
  this.negocioForm.patchValue({
    idlibreria: xdat.idlibreria,
    nit: xdat.nit,
    razon_social: xdat.razon_social,
    direccion: xdat.direccion,
    telefono: xdat.telefono,
    estado: xdat.estado,
    fecha: xdat.fecha,
    hora: xdat.hora,
    persona: xdat.persona,
    ciudad: Seleccionada,
  })
}
modificarNegocio() {
    const ciudadselect = this.negocioForm.get('ciudad')?.value as Ciudad;
    const cliente = this.Obtenercliente;

    this.xper = {
      idlibreria: this.negocioForm.get('idlibreria')?.value,
      persona: this.negocioForm.get('persona')?.value,
      nit: this.negocioForm.get('nit')?.value,
      razon_social: this.negocioForm.get('razon_social')?.value,
      direccion: this.negocioForm.get('direccion')?.value,
      telefono: this.negocioForm.get('telefono')?.value,
      estado: this.negocioForm.get('estado')?.value,
      fecha: this.negocioForm.get('fecha')?.value,
      hora: this.negocioForm.get('hora')?.value,
      ciudad: ciudadselect,
      
     
    },
  console.log("datos enviando::",this.xper);
  
    this.libreService
      .ModificarNegocio(this.xper)
      .subscribe(() => {
        this.libreService.ListarNegocio(this.Obtenercliente.idpersona).subscribe((fall) => (this.listaNegocio
         = fall))
         
        this.negocioForm.reset();
      });
      this.mostrarMensaje('Datos actualizados correctamente, inicia sesión nuevamente.');
  }

    // eliminar negocio


mensajeEmergente: string = '';

mostrarMensaje(mensaje: string, duracion: number = 4000) {
  this.mensajeEmergente = mensaje;
  setTimeout(() => {
    this.mensajeEmergente = '';
  }, duracion);
}






    // login
    credencial: Credencial = {
        usuario: '',
        contrasena: ''
      };
      mensaje: string = '';
      exito: boolean | null = null; 
 mostrarMensaje1(msg: string, exito: boolean) {
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
     this.mostrarMensaje1('Ingrese su usuario y contraseña', false);
      this.exito = false;
      return;
    }
    this.cargando = true;
    this.credeService.iniciarSesion(this.credencial.usuario, this.credencial.contrasena)
      .subscribe({
        next: (res) => {
          console.log('ROL del usuario:', res.rol?.idrol);
  
          if (res.estado === 0) {
            this.exito = false;
            this.mostrarMensaje1('Sus credenciales han sido bloqueadas. No puede acceder.', false);
            return;
          }
  
          if (res.rol === 'Cliente') {
            this.exito = true;
            localStorage.setItem('token', res.token);
            localStorage.setItem('idpersona', res.idpersona);
            localStorage.setItem('usuarioCompleto', JSON.stringify(res));
            this.actualizarService.notificarCambio();
               this.mostrarLogin = false;
  
            // Puedes también llamar aquí a los modelos si es necesario:
            this.modelPersona();
          this.modelNegocio();
          this.modelCiudad();
          this.modelDepartamento();
  
          } else {
            this.exito = false;
            this.mostrarMensaje1('Lo siento no tienes permisos.', false);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.exito = false;
          this.mostrarMensaje1('Usuario o contraseña Incorrecto', false);
          console.error('Error en login:', err); 
        }
      });
  }


}