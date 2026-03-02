import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Credencial } from 'src/app/model/credencial';
import { Persona } from 'src/app/model/persona';
import { Rol } from 'src/app/model/rol';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { PersonaService } from 'src/app/servicio/persona.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
})
export class PerfilComponent  implements OnInit {

  pag = 1;   
  getPasswordStrengthClass(password: string): string {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[\W]/.test(password)) strength++;

  if (strength <= 1) return 'weak';
  if (strength === 2 || strength === 3) return 'medium';
  return 'strong';
}

  xper!: any;
  mostrarFormularioEmpresa: boolean = false;
  filtro: string = ''; 
  listaPersona: Persona[] = [];
  listaRol: Rol[]=[];
  listaCredencial: Credencial[]=[];

  credeForm: any = new FormGroup({
    usuario: new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30),
  ]),
  contrasena: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(50),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),  
  ]),
  confirmar_contrasena: new FormControl(''),
    persona: new FormControl(''),
  }, { validators: this.passwordsIgualesValidator });

  PersonaForm: any = new FormGroup({
  idpersona: new FormControl(''),
  cedula: new FormControl('', [
    Validators.pattern(/^[0-9]*$/),
    Validators.maxLength(11)
  ]),
  nombre: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(40),
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/) 
  ]),
  ap_paterno: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(40),
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
  ]),
  ap_materno: new FormControl('', [
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
  ]),
  telefono: new FormControl('', [
    Validators.required,
    Validators.minLength(7),
    Validators.maxLength(20),
    Validators.pattern(/^[\+\-]?[0-9\-]+$/)
  ]),
  direccion: new FormControl('', [
    Validators.minLength(4),
    Validators.maxLength(255)
  ]),
  fotografia: new FormControl(''), 
  fecha: new FormControl(''),
  hora: new FormControl(''),
  correo: new FormControl('', [
    Validators.email 
  ]),
  genero: new FormControl('', [
    Validators.required
  ]),
  estado: new FormControl(''),
  rol: new FormControl('', [
    Validators.required
  ])
});

  constructor(private actualizarService: ActualizarnombreService, private PerService: PersonaService, private credeService: CredencialService) {
     }

  passwordsIgualesValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const pass = control.get('contrasena')?.value;
  const confirm = control.get('confirmar_contrasena')?.value;

  if (pass && confirm && pass !== confirm) {
    return { passwordsNoCoinciden: true };
  }
  return null;
}
loadingQ: boolean = false;
modelPersona() {
  this.loadingQ=true;
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const id = usuario?.idpersona;
  this.PerService.ListarPersonas().subscribe(personas => {
    this.listaPersona = personas.filter(p => p.idpersona === id);
    console.log('Persona filtrada:', this.listaPersona);
    const persona = this.listaPersona[0];
    if (persona) {
      this.vistaModPersona(persona); // <-- Carga datos al formulario
    }
  });
  this.loadingQ=false;
  
}
 modelCredencial() {
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const id = usuario?.idpersona;
    this.credeService.listarCredencial().subscribe((personas) => {
this.listaCredencial = personas.filter(p => p.persona?.idpersona === id);
    console.log('Persona filtrada:', this.listaCredencial);
    const persona = this.listaCredencial[0];
    if (persona) {
    this.vistaUser(persona); 
    }
  });
  }
  eliminarImagen() {
  // Limpiar la imagen seleccionada
  this.imagenSeleccionada = undefined!;

  // Eliminar la imagen actual (ya no se enviará)
  this.nombreImagenExistente = '';

  // Reemplazar la vista previa con la imagen por defecto
  const imgElement = document.querySelector('img[alt="Foto de perfil"]') as HTMLImageElement;
  if (imgElement) {
    imgElement.src = 'assets/user.png';
  }

  // Llamar directamente a guardar (como si fuera editar sin imagen)
  this.modificarPersona();
}

  mostrarLogin: boolean = false;
  ngOnInit(): void { 
         const token = localStorage.getItem('token');

  if (!token) {
    this.mostrarLogin = true;
    return;
  }
    this.modelPersona();
    this.modelCredencial();
  }

// modficar daos persona 
nombreImagenExistente: string = '';
 imagenSeleccionada!: File;

onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;

      // Vista previa (opcional)
      const reader = new FileReader();
      reader.onload = () => {
        // Actualiza la imagen mostrada
        this.nombreImagenExistente = ''; // Limpia el nombre anterior para forzar mostrar la nueva imagen
        const imgElement = document.querySelector('img[alt="Foto de perfil"]') as HTMLImageElement;
        if (imgElement) {
          imgElement.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
       this.modificarPersona();
    }
  }


vistaModPersona(xdat: Persona) { 
  this.PersonaForm.patchValue({
    idpersona: xdat.idpersona,
    nombre: xdat.nombre,
    ap_materno: xdat.ap_materno,
    ap_paterno: xdat.ap_paterno,
    rol: xdat.rol,
    cedula: xdat.cedula,
    telefono: xdat.telefono,
    direccion: xdat.direccion,
    fotografia: this.nombreImagenExistente = xdat.fotografia || '',
    fecha: xdat.fecha,
    hora: xdat.hora,
    correo: xdat.correo,
    genero: xdat.genero,
    estado: xdat.estado,
  })
}
 modificarPersona() {
    console.log("Entró a registrar catálogo");
  console.log("llega imagen: ",this.imagenSeleccionada);
  
  if (this.imagenSeleccionada) {
    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    this.PerService.GuardarFotografia(formData).subscribe({
      next: (resp) => {
        const nombreImagen = resp.nombre;
        this.modificarDatosPersona(nombreImagen);
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
      }
    });
  } else {
    this.modificarDatosPersona(this.nombreImagenExistente);
  }
}

modificarDatosPersona(nombreImagen: string) {
  const telefonoValor = this.PersonaForm.get('telefono')?.value;
const telefonoFinal = telefonoValor === '' ? null : telefonoValor;
    this.xper = {
      cedula: this.PersonaForm.get('cedula')?.value,
      idpersona: this.PersonaForm.get('idpersona')?.value,
      nombre: this.PersonaForm.get('nombre')?.value,
      ap_paterno: this.PersonaForm.get('ap_paterno')?.value,
      ap_materno: this.PersonaForm.get('ap_materno')?.value,
      direccion: this.PersonaForm.get('direccion')?.value,
      telefono: telefonoFinal,
      fotografia: nombreImagen,
      fecha: this.PersonaForm.get('fecha')?.value,
      hora: this.PersonaForm.get('hora')?.value,
      genero: this.PersonaForm.get('genero')?.value,
      correo: this.PersonaForm.get('correo')?.value,
      estado: this.PersonaForm.get('estado')?.value,
      rol: this.PersonaForm.get('rol')?.value,
    },
  console.log("datos enviando::"+this.xper);
  
     this.PerService.ModificarPersona(this.xper).subscribe(() => {
    this.mostrarMensaje('Datos actualizados, inicia sesión nuevamente.');
    this.PerService.ListarPersonas().subscribe(() => {
      this.modelPersona();
    });
    this.PersonaForm.reset();
  });
}
 @ViewChild('fileInput') fileInput!: ElementRef;
 abrirGaleria() {
    this.fileInput.nativeElement.click(); // dispara el input file
  }

 // registrar usuario para cliente
  personaSelect: Persona | null = null;
  modoEditar: boolean = false;
mensajeEmergente: string = '';

mostrarMensaje(mensaje: string, duracion: number = 4000) {
  this.mensajeEmergente = mensaje;
  setTimeout(() => {
    this.mensajeEmergente = '';
  }, duracion);
}

  vistaUser(fall: Credencial) {
      this.credeForm.patchValue({
        usuario: fall.usuario,
        contrasena: '',
      });
  } 
   registrarCredencial() {
    console.log("pasooo: ");
      this.xper = {
      usuario: this.credeForm.get('usuario')?.value,
      contrasena: this.credeForm.get('contrasena')?.value,
      persona: this.personaSelect

    },
  console.log("datos correctos enviados:: ",this.xper);
    this.credeService
      .modificarCredencial(this.xper)
      .subscribe(() => {
        
      });
      this.mostrarMensaje('Contraseña actualizado. Por favor, inicia sesion nuevamente.');
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
            localStorage.setItem('usuarioCompleto', JSON.stringify(res));
            this.actualizarService.notificarCambio();
               this.mostrarLogin = false;
  
            // Puedes también llamar aquí a los modelos si es necesario:
            this.modelPersona();
            this.modelCredencial();
  
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


  
  ip = window.location.hostname;

}
