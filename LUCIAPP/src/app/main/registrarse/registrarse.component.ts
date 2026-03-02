import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Ciudad } from 'src/app/model/ciudad';
import { Credencial } from 'src/app/model/credencial';
import { Departamento } from 'src/app/model/departamento';
import { Genero } from 'src/app/model/genero';
import { Negocio } from 'src/app/model/negocio';
import { Persona } from 'src/app/model/persona';
import { Rol } from 'src/app/model/rol';
import { CiudadService } from 'src/app/servicio/ciudad.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { RolService } from 'src/app/servicio/rol.service';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.scss'],
   standalone: true,
  imports: [CommonModule, RouterModule,FormsModule, ReactiveFormsModule],
})
export class RegistrarseComponent  implements OnInit {

  listaPersona: Persona[] = [];
  listaRol: Rol[]=[];
  listaCredencial: Credencial[]=[];
listaCiudad: Ciudad[] =[];
listaDepartamento: Departamento[] =[];
listaNegocio: Negocio[]=[];
  negocioForm: any = new FormGroup({
    idnegocio: new FormControl(''),
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
  telefono: new FormControl('',[Validators.minLength(7),
      Validators.maxLength(20),
      Validators.pattern(/^[\+\-]?[0-9\-]+$/)]),
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
    persona: new FormControl(''),
   confirmar_contrasena: new FormControl('', Validators.required),
  terminos: new FormControl(false, Validators.requiredTrue) // ✅ nuevo campo obligatorio
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
  telefono: new FormControl('',[
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
  genero: new FormControl('', Validators.required),
  estado: new FormControl(''),
  rol: new FormControl('')
});

constructor(private router: Router, private libreService: NegocioService,private cuidadService: CiudadService, private PerService: PersonaService, private credeService: CredencialService,
     private rolService: RolService,  private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }

      passwordsIgualesValidator(control: AbstractControl): { [key: string]: boolean } | null {
       const pass = control.get('contrasena')?.value;
       const confirm = control.get('confirmar_contrasena')?.value;
     
       if (pass && confirm && pass !== confirm) {
         return { passwordsNoCoinciden: true };
       }
       return null;
     }
     modelPersona() {
  this.PerService.ListarPersonas().subscribe((fall) => {
    this.listaPersona = fall.filter(p => p.rol?.idrol !== 1 && p.rol?.idrol !== 5)
    .sort((a, b) => b.idpersona - a.idpersona);
  });
}
 modelCiudad() {
   this.cuidadService.ListarCuidad().subscribe((res) => {
    this.listaCiudad = res;
  });
}

listaGenero: Genero[]=[];
  modelGenero() {
    this.PerService.ListarGenero().subscribe((fall) => (this.listaGenero = fall)) 
  }

  ngOnInit(): void {
    this.modelGenero();
    this.modelPersona();
    this.modelCiudad();
  }
  modelRol() {
    this.rolService.ListarRol().subscribe((fall) => (this.listaRol = fall)) 
  }
  modelCredencial() {
    this.credeService.listarCredencial().subscribe((fall) => (this.listaCredencial = fall)) 
  }
  cedulaYaRegistrada(): boolean {
  const cedulaIngresada = this.PersonaForm.get('cedula')?.value;
  if (!cedulaIngresada) return false;

  return this.listaPersona.some(
    (p) => p.cedula === cedulaIngresada
  );
}

correoYaRegistrada(): boolean {
  const cedulaIngresada = this.PersonaForm.get('correo')?.value;
  if (!cedulaIngresada) return false;

  return this.listaPersona.some(
    (p) => p.correo === cedulaIngresada
  );
}
telefonoYaRegistrada(): boolean {
  const cedulaIngresada = this.PersonaForm.get('telefono')?.value;
  if (!cedulaIngresada) return false;

  return this.listaPersona.some(
    (p) => p.telefono == cedulaIngresada
  );
}
verContrasena: boolean = false;
 modoEditar: boolean = false;
usuarioYaRegistrada(): boolean {
  if (this.modoEditar) return false; 
  const cedulaIngresada = this.credeForm.get('usuario')?.value;
  if (!cedulaIngresada) return false;

  return this.listaCredencial.some(
    (p) => p.usuario === cedulaIngresada
  );
}

xper!: any;
imagenSeleccionada!: File;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.imagenSeleccionada = file;

    // Opcional: vista previa
    const reader = new FileReader();
    reader.onload = () => {
      console.log("Imagen seleccionada para previsualización",this.imagenSeleccionada);
    };
    reader.readAsDataURL(file);
  }
}


  registrarPersona() {
    console.log("Entró a registrar catálogo");
  console.log("llega imagen: ",this.imagenSeleccionada);
  
  if (this.imagenSeleccionada) {
    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    this.PerService.GuardarFotografia(formData).subscribe({
      next: (resp) => {
        const nombreImagen = resp.nombre;
        this.guardarDatosPersona(nombreImagen);
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
      }
    });
  } else {
    // Si no se seleccionó imagen, se puede continuar sin imagen o mostrar error
    this.guardarDatosPersona('');
  }
}

guardarDatosPersona(nombreImagen: string) {
  const genero = this.PersonaForm.get('genero')?.value as Genero;
  const telefonoValor = this.PersonaForm.get('telefono')?.value;
const telefonoFinal = telefonoValor === '' ? null : telefonoValor;
    const fecha = new Date();
    const hora = fecha.toTimeString().split(' ')[0];
    this.xper = {
      cedula: this.PersonaForm.get('cedula')?.value,
      nombre: this.PersonaForm.get('nombre')?.value,
      ap_paterno: this.PersonaForm.get('ap_paterno')?.value,
      ap_materno: this.PersonaForm.get('ap_materno')?.value,
      direccion: this.PersonaForm.get('direccion')?.value,
      telefono: telefonoFinal,
      fotografia: nombreImagen,
      fecha: fecha,
      hora: hora,
      genero: genero,
      correo: this.PersonaForm.get('correo')?.value,
      estado: 1,
     rol:  [ { idrol: 2, nombre: "Cliente" } ]
    },
  console.log("datos enviando::"+this.xper);
this.PerService.RegistrarPersona(this.xper).subscribe((personaCreada) => {
  this.PersonaForm.reset();
  this.personaRegistrada = personaCreada; // 💾 Guarda TODO el objeto completo
  this.registrarDatosGenerales();
});

  }

personaRegistrada: any = null;
 registrarNegocio() {
    const ciudadselect = this.negocioForm.get('ciudad')?.value as Ciudad;
    const fecha = new Date();
    const hora = fecha.toTimeString().split(' ')[0];
 
  const nitValor = this.negocioForm.get('nit')?.value;
  const nitFinal = nitValor === '' || nitValor === null || isNaN(nitValor) ? null : nitValor;

    this.xper = {
      nit: nitFinal,
      razon_social: this.negocioForm.get('razon_social')?.value,
      direccion: this.negocioForm.get('direccion')?.value,
      estado:0,
      fecha: fecha,
      hora: hora,
      ciudad: ciudadselect,
      persona: this.personaRegistrada,
     
    },
  console.log("datos enviando::",this.xper);
  
    this.libreService
      .RegistrarNegocio(this.xper)
      .subscribe(() => {
   this.registrarDatosNegocio() 
        this.negocioForm.reset();
      });
  }
loadingSave = false;
 registrarCredencial() {
  this.loadingSave = true;
  if (!this.personaRegistrada) {
    console.error("Error: No hay persona registrada aún.");
    return;
  }

  const credencial = {
    usuario: this.credeForm.get('usuario')?.value,
    contrasena: this.credeForm.get('contrasena')?.value,
    persona: this.personaRegistrada // aquí va todo el objeto persona
  };

  console.log("Enviando credenciales:", credencial);

  this.credeService.registrarCredencial(credencial).subscribe(() => {
    this.credeForm.reset();
    this.loadingSave = false;
    this.mostrarMensaje('Cuenta creada con éxito. !!Por fabor espera unos segundos¡¡', 7000);
  });


}

mensajeEmergente: string = '';

mostrarMensaje(mensaje: string, duracion: number = 7000) {
  this.mensajeEmergente = mensaje;
  setTimeout(() => {
    this.mensajeEmergente = '';
    this.router.navigate(['/main/iniciar/sesion']);
  }, duracion);
}


currentStep = 0;
  pasos = ['Datos Personales', 'Datos Libreria', 'Credenciales'];

  siguientePaso() {
    if (this.currentStep < this.pasos.length - 1) {
      this.currentStep++;
    }
  }

  anteriorPaso() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  terminarRegistro() {
    alert('¡Registro completado exitosamente!');
    // Aquí podrías enviar los datos o navegar a otra página
  }
  registrarDatosGenerales() {
  // lógica para guardar datos del paso 1
  console.log('Datos Generales registrados');
  this.siguientePaso(); // o lo puedes quitar si no quieres avanzar automáticamente
}

registrarDatosNegocio() {
  // lógica para guardar datos del paso 2
  console.log('Datos de Negocio registrados');
  this.siguientePaso();
}


telefonoYaRegistrada1(): boolean {
  const cedulaIngresada = this.negocioForm.get('telefono')?.value;
  if (!cedulaIngresada) return false;

  return this.listaNegocio.some(
    (p) => p.telefono == cedulaIngresada
  );
}
NITYaRegistrada(): boolean {
  const cedulaIngresada = this.negocioForm.get('nit')?.value;
  if (!cedulaIngresada) return false;

  return this.listaNegocio.some(
    (p) => p.nit == cedulaIngresada
  );
}
nombreYaRegistrada1(): boolean {
  const cedulaIngresada = this.negocioForm.get('razon_social')?.value;
  if (!cedulaIngresada) return false;

  return this.listaNegocio.some(
    (p) => p.razon_social == cedulaIngresada
  );
}
}
