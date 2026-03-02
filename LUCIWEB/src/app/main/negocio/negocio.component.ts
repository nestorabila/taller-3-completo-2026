import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Negocio } from 'src/app/model/negocio';
import { Persona } from 'src/app/model/persona';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { RolService } from 'src/app/servicio/rol.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Ciudad } from 'src/app/model/ciudad';
import { CuidadService } from 'src/app/servicio/ciudad.service';
import { Departamento } from 'src/app/model/departamento';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-negocio',
  imports: [ProgressSpinnerModule, SplitterModule, FieldsetModule, AvatarModule, DialogModule, ReactiveFormsModule, FormsModule,CommonModule, ConfirmDialog, ToastModule, ButtonModule],
        providers: [ConfirmationService, MessageService],
  templateUrl: './negocio.component.html',
  styleUrl: './negocio.component.css'
})
export class NegocioComponent {
  mostrarFormulario: boolean = false;
listaCiudad: Ciudad[] =[];
listaDepartamento: Departamento[] =[];
listaPersona: Persona[] = [];
listaNegocio: Negocio[]=[];
listaLibreria: Negocio[]=[];
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
    
    direccion: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(255)
  ]),
    fecha: new FormControl(''),
    persona: new FormControl(''),
    ciudad: new FormControl('', Validators.required),
  
  })
 constructor(private confirmationService: ConfirmationService, private messageService: MessageService,
    private PerService: PersonaService,private cuidadService: CuidadService, private credeService: CredencialService,
     private rolService: RolService, private libreService: NegocioService, private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }
     loading: boolean = false;
modelPersona() {
  this.loading = true;
  this.PerService.ListarPersonas().subscribe((fall) => {
   this.listaPersona = fall.filter(p => p.estado === 1 && p.rol?.some(r => r.idrol === 2))
                        .sort((a, b) => b.idpersona - a.idpersona);
  
    this.loading = false;
  });
}

modelLibreria() {
  this.libreService.ListarNegocioCompleto().subscribe((res) => {
    this.listaLibreria = res;
    this.totalLibrerias = res.length;

   this.nuevasLibrerias = res.filter(n =>
      this.esNuevo(n.fecha)
    ).length;


    this.desdeWeb = this.totalLibrerias - this.desdeMovil;
  });
}

totalLibrerias: number = 0;
desdeMovil: number = 0;
desdeWeb: number = 0;
nuevasLibrerias: number = 0;
esNuevo(fecha: Date): boolean {
  const ahora = new Date();
  const fechaPersona = new Date(fecha);

  const milisegundosEnTresDias = 3 * 24 * 60 * 60 * 1000;

  // Si la fecha del registro está entre ahora y hace 3 días
  return (ahora.getTime() - fechaPersona.getTime()) <= milisegundosEnTresDias;
}

   modelNegocio() {
  if (this.Obtenercliente) {
    this.libreService.ListarNegocio(this.Obtenercliente.idpersona).subscribe((fall) => {
      this.listaNegocio= fall;
      this.modelLibreria();
    });
  } else {
  }
}
modelDepartamento() {
  this.cuidadService.ListarDep().subscribe((res) => {
    
    this.listaDepartamento = res;
  });
}
 modelCiudad() {
   this.cuidadService.ListarCuidad().subscribe((res) => {
    this.listaCiudad = res;
  });
}


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.modelPersona();
    this.modelNegocio();
    this.modelCiudad();
    this.modelLibreria();
    this.modelDepartamento();
}
// buscar cliente
filtro: string = ''; 
 buscar() {
  if (this.filtro.trim()) {
    this.PerService.buscarPersonas(this.filtro).subscribe((result) => {
     this.listaPersona = result.filter(p => p.estado === 1 && p.rol?.some(r => r.idrol === 2));

    });
  } else {
    this.modelPersona(); // Si el filtro está vacío, recargar todas las personas
  }
}
  // registar libreria negocio
  radioSeleccionado: boolean = false;
  Obtenercliente!: Persona;
  vista(fall: Persona) {
    this.Obtenercliente = fall; 
    this.radioSeleccionado = true;
    this.modelNegocio(); 
  }
  xper!: any;
  registrarNegocio() {
   const nombrePersona = localStorage.getItem('nombreCompleto') || 'Desconocido';

    const ciudadselect = this.negocioForm.get('ciudad')?.value as Ciudad;
    const fecha = new Date();
    const hora = fecha.toTimeString().split(' ')[0];
    const cliente = this.Obtenercliente;
    this.xper = {
      nit: this.negocioForm.get('nit')?.value,
      razon_social: this.negocioForm.get('razon_social')?.value,
      direccion: this.negocioForm.get('direccion')?.value,
      telefono: this.negocioForm.get('telefono')?.value,
      fecha: fecha,
      hora: hora,
      estado: 0,
      ciudad: ciudadselect,
      persona: cliente,
     
    },
 
  
    this.libreService
      .RegistrarNegocio(this.xper)
      .subscribe(() => {
      this.libreService.ListarNegocio(this.Obtenercliente.idpersona)
      .subscribe((fall) => {

        this.listaNegocio = fall;

        // ✔ TOMAMOS EL ÚLTIMO REGISTRO INSERTADO (EL NUEVO)
        const nuevoNegocio = fall[fall.length - 1];

        // ✔ ABRIR MODAL DE VERIFICACIÓN CON DATOS CORRECTOS
        this.vistaEliminar(nuevoNegocio);
        this.visibleVerificacion = true;

      });

    this.negocioForm.reset();
  });
  }
// modificar negocio

vistaNegocio(xdat: Negocio) { 
  const Seleccionada = this.listaCiudad.find(c => c.idciudad === xdat.ciudad?.idciudad) || null;
  this.negocioForm.patchValue({
    idlibreria: xdat.idlibreria,
    nit: xdat.nit,
    razon_social: xdat.razon_social,
    direccion: xdat.direccion,
    telefono: xdat.telefono,
    fecha: xdat.fecha,
    hora: xdat.hora,
    estado:xdat.estado,
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
      fecha: this.negocioForm.get('fecha')?.value,
      estado: this.negocioForm.get('estado')?.value,
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
  }

    // eliminar negocio
 // Variables
visibleVerificacion: boolean = false;
codigoIngresado: string = '';
perInfo: string = '';
eliminarNegocio!: Negocio;

// Abrir modal
vistaEliminar(fall: Negocio) {
  this.perInfo = fall.razon_social;
  this.eliminarNegocio = fall;
  this.codigoIngresado = '';
  this.visibleVerificacion = true;
}

// Cancelar
cancelarVerificacion() {
  this.visibleVerificacion = false;
  this.messageService.add({
    severity: 'warn',
    summary: 'Cancelado',
    detail: 'No se realizó la verificación.',
    life: 2500
  });
}

// Verificar código
verificarCodigo() {
  if (this.codigoIngresado === this.eliminarNegocio.codigo) {
    this.EliminarNegocio();
    this.visibleVerificacion = false;
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Código incorrecto',
      detail: 'El código ingresado no coincide.',
      life: 3000
    });
  }
}

// Cambiar estado de la librería
EliminarNegocio() {
  if (this.eliminarNegocio && this.eliminarNegocio.idlibreria) {
    this.eliminarNegocio.estado = 1;

    this.libreService.cambiarEstadoLibreria(this.eliminarNegocio).subscribe({
      next: (res) => {
        this.modelNegocio();
        this.messageService.add({
          severity: 'success',
          summary: 'Verificación correcta',
          detail: `${this.perInfo} ahora está verificado.`,
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado.',
          life: 4000
        });
      }
    });
  } else {
    console.warn('No hay librería seleccionada o no tiene id.');
  }
}

reenviarCodigo() {
  if (!this.eliminarNegocio?.idlibreria) return;

  this.libreService
    .reenviarCodigoLibreria(this.eliminarNegocio.idlibreria)
    .subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Código reenviado',
          detail: 'Se envió un nuevo código a la librería.',
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo reenviar el código.',
          life: 3000
        });
      }
    });
}





// estos es para registo peude peude utulis simaires eso pero otros metofos direntes para no choeque
visibleSC: boolean = false;

    showDialogSC() {
        this.visibleSC = true;
    }

    guardarRegistroSC() {
  this.visibleSC = false;
  this.messageService.add({
    severity: 'success',
    summary: 'Actualizado',
    detail: 'Datos Actualizado exitosamente.',
    life: 3000
  });
}

cancelarRegistroSC() {
  this.negocioForm.reset();
  this.visibleSC = false;
  this.messageService.add({
    severity: 'info',
    summary: 'Cancelado',
    detail: 'No se realizó ninguna operación.',
    life: 3000
  });
}
 

    telefonoYaRegistrada(): boolean {
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
    (p) => p.nit.toLowerCase().trim() == cedulaIngresada.toLowerCase()
  );
}
nombreYaRegistrada(): boolean {
  const cedulaIngresada = this.negocioForm.get('razon_social')?.value;
  if (!cedulaIngresada) return false;

  return this.listaNegocio.some(
    (p) => p.razon_social.toLowerCase().trim() == cedulaIngresada.toLowerCase()
  );
}
}