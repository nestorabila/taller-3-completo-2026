import { Component, OnInit, ViewChild , ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Persona } from 'src/app/model/persona';
import { HttpClient } from '@angular/common/http';
import { PersonaService } from 'src/app/servicio/persona.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { Credencial } from 'src/app/model/credencial';
import { Rol } from 'src/app/model/rol';
import { RolService } from 'src/app/servicio/rol.service';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { MenuItem,ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NgxPaginationModule } from 'ngx-pagination';
import { SpeedDial } from 'primeng/speeddial';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MultiSelectModule } from 'primeng/multiselect';
import { Genero } from 'src/app/model/genero';

@Component({
    selector: 'app-persona',
      imports: [  MultiSelectModule,ProgressSpinnerModule, FieldsetModule,AvatarModule,SplitterModule, TooltipModule, InputSwitchModule, NgxPaginationModule,  Dialog, RadioButtonModule, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
      providers: [ConfirmationService, MessageService],
    templateUrl: './persona.component.html',
    styleUrls: ['./persona.component.css'],
})
export class PersonaComponent  {
  pag = 1;   
 
getPasswordStrengthClass(password: string): string {
  let strength = 0;

  if (!password) return 'bg-gray-300'; // vacío

  // Reglas básicas de validación
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++; // caracteres especiales
  if (password.length >= 10) strength++; // extra: contraseña larga

  // Retornar clases según fuerza
  if (strength <= 2) {
    return 'bg-red-500 w-1/3';   // débil → rojo
  } else if (strength === 3 || strength === 4) {
    return 'bg-yellow-400 w-2/3'; // medio → amarillo
  } else {
    return 'bg-green-500 w-full'; // fuerte → verde
  }
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
    persona: new FormControl(''),
  
  })

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
  fotografia: new FormControl('',[this.validarFormatoImagen]), 
  fecha: new FormControl(''),
  hora: new FormControl(''),
  correo: new FormControl('', [Validators.required,
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

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService,
    private PerService: PersonaService, private credeService: CredencialService,
     private rolService: RolService,  private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }
 validarFormatoImagen(control: AbstractControl): ValidationErrors | null {
  const file = control.value;

  if (!file) return null; // No hay archivo, no hay error

  // Si el control tiene un File válido
  if (file instanceof File) {
    const tipoArchivo = file.type;
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(tipoArchivo)) {
      return { formatoInvalido: true };
    }
  } else if (typeof file === 'string') {
    // Si por algún motivo se guarda el nombre del archivo
    const extensionesPermitidas = /\.(jpg|jpeg|png)$/i;
    if (!extensionesPermitidas.test(file)) {
      return { formatoInvalido: true };
    }
  }

  return null;
}



     loading: boolean = false;
  modelPersona() {
    this.loading = true;
  this.PerService.ListarPersonas().subscribe((fall) => {
   
    this.listaPersona = fall.filter(p => !p.rol?.some(r => r.idrol === 1))
    .sort((a, b) => b.idpersona - a.idpersona);
    this.contarTotales();
    this.loading = false;
  });
}
getRolesString(persona: Persona): string {
  if (!persona.rol || persona.rol.length === 0) return 'Sin Rol';
  return persona.rol.map(r => r.nombre).join(', ');
}

totalPersonas: number = 0;
nuevosRegistros: number = 0;
totalClientes: number = 0;
totalProveedores: number = 0;
totalPersonal: number = 0;
totalActivos: number = 0;
totalBloqueados: number = 0;
contarTotales() {
  this.PerService.ListarPersonas().subscribe((personas) => {
   const lista = personas.filter(p => p.rol?.every(r => r.idrol !== 1));
 // filtra fuera el admin

    this.totalPersonas = lista.length;
    this.nuevosRegistros = lista.filter(p => this.esNuevo(p.fecha)).length;
    this.totalClientes = lista.filter(p => p.rol?.some(r => r.idrol === 2)).length;

this.totalProveedores = lista.filter(p => p.rol?.some(r => r.idrol === 5)).length;

this.totalPersonal = lista.filter(p => 
    p.rol?.some(r => r.idrol === 3 || r.idrol === 4)
).length;

    this.totalActivos = lista.filter(p => p.estado === 1).length;
    this.totalBloqueados = lista.filter(p => p.estado === 0).length;
  });
}
esNuevo(fecha: Date): boolean {
  const ahora = new Date();
  const fechaPersona = new Date(fecha);

  const milisegundosEnTresDias = 3 * 24 * 60 * 60 * 1000;

  // Si la fecha del registro está entre ahora y hace 3 días
  return (ahora.getTime() - fechaPersona.getTime()) <= milisegundosEnTresDias;
}

  modelRol() {
    this.rolService.ListarRol().subscribe((fall) => (this.listaRol = fall)) 
  }
 listaGenero: Genero[]=[];
  modelGenero() {
    this.PerService.ListarGenero().subscribe((fall) => (this.listaGenero = fall)) 
  }

  modelCredencial() {
    this.credeService.listarCredencial().subscribe((fall) => (this.listaCredencial = fall)) 
  }


  mostrarEmpresaForm() {
    this.mostrarFormularioEmpresa = true;
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

usuarioYaRegistrada(): boolean {
  if (this.modoEditar) return false; 
  const cedulaIngresada = this.credeForm.get('usuario')?.value;
  if (!cedulaIngresada) return false;

  return this.listaCredencial.some(
    (p) => p.usuario === cedulaIngresada
  );
}


rolSeleccionado = false;
  mostrarCamposExtra: boolean = true;
  ngOnInit(): void {
this.PersonaForm.get('rol')?.valueChanges.subscribe((valor: Rol) => {
  this.rolSeleccionado = !!valor;
});
    this.filtrarPersonas('todos'); 
    this.modelPersona();
    this.contarTotales();
    this.modelRol();
    this.modelGenero();
    this.modelCredencial();
    this.PersonaForm.get('rol')?.valueChanges.subscribe((rolselect: { nombre: string; }) => {
      // rolSeleccionado puede ser un objeto Rol
      if (rolselect?.nombre === 'Cliente' || rolselect?.nombre === 'Proveedor') {
        this.mostrarCamposExtra = false;
      } else {
        this.mostrarCamposExtra = true;
      }
    });
  }
  // llama de aqui al metod buscar 
  filtrarPersonas(filtro: string) {
    this.PerService.ListarPersonasFiltradas(filtro).subscribe(
      (data) => {
         this.listaPersona = data.sort((a, b) => b.idpersona - a.idpersona);
      },
      (error) => {
        console.error("Error al filtrar personas:", error);
      }
    );
  }
  
  buscar() {
  if (this.filtro.trim()) {
    this.PerService.buscarPersonas(this.filtro).subscribe((result) => {
     this.listaPersona = result.filter(p => p.rol?.every(r => r.idrol !== 1));

    });
  } else {
    this.modelPersona(); 
  }
}

visible1: boolean = false;
  
      showDialogP() {
          this.visible1 = true;
      }
  
    guardarRegistroP() {
    this.visible1 = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'El registro fue guardado exitosamente.',
      life: 3000
    });
  }
  
  cancelarRegistroP() {
    this.visible1 = false;
    this.PersonaForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }

  visible4: boolean = false;
  
      showDialogM() {
          this.visible4 = true;
      }
  
    guardarRegistroPM() {
    this.visible4 = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos actualizados exitosamente.',
      life: 3000
    });
  }
  
  cancelarRegistroPM() {
    this.visible4 = false;
    this.PersonaForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }
imagenSeleccionada!: File;

onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.imagenSeleccionada = file;

    const control = this.PersonaForm.get('fotografia');
    control?.setValue(file);
    control?.updateValueAndValidity();

    control?.markAsTouched();
    control?.markAsDirty();

    // Opcional: vista previa
    const reader = new FileReader();
    reader.onload = () => {
      
    };
    reader.readAsDataURL(file);
  }
}

  registrarPersona() {
   
  this.loadingSave = true;
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
    const rolselect = this.PersonaForm.get('rol')?.value as Rol[];
    const genero = this.PersonaForm.get('genero')?.value as Genero;
    const fecha = new Date();
    const hora = fecha.toTimeString().split(' ')[0];
    this.xper = {
      cedula: this.PersonaForm.get('cedula')?.value,
      nombre: this.PersonaForm.get('nombre')?.value,
      ap_paterno: this.PersonaForm.get('ap_paterno')?.value,
      ap_materno: this.PersonaForm.get('ap_materno')?.value,
      direccion: this.PersonaForm.get('direccion')?.value,
      telefono: this.PersonaForm.get('telefono')?.value,
      fotografia: nombreImagen,
      fecha: fecha,
      hora: hora,
      genero: genero,
      correo: this.PersonaForm.get('correo')?.value,
      estado: 1,
      rol: rolselect,
    },
  console.log("datos enviando::",this.xper);
  
    this.PerService.RegistrarPersona(this.xper).subscribe(() => {
        this.modelPersona(); 
        this.loadingSave = false;
        this.PersonaForm.reset();
        this.guardarRegistroP();
      });
  }
// modficar daos persona 
nombreImagenExistente: string = '';

vistaModPersona(xdat: Persona) { 
  console.log("=== vistaModPersona ===");
  console.log("Datos completos recibidos:", xdat);
  console.log("Rol en xdat.rol:", xdat.rol);
 const Selegenero= this.listaGenero.find(c => c.idgenero === xdat.genero?.idgenero) || null;
  // Convertimos a array siempre
  const rolesPersona: Rol[] = Array.isArray(xdat.rol) ? xdat.rol : xdat.rol ? [xdat.rol] : [];
  console.log("rolesPersona (convertido a array):", rolesPersona);

  // Seleccionamos los roles de la lista completa que estén asignados a la persona
  const rolesSeleccionados = this.listaRol.filter(r => {
    const encontrado = rolesPersona.some(xr => xr.idrol === r.idrol);
    console.log(`Revisando rol ${r.nombre} (id: ${r.idrol}) => encontrado:`, encontrado);
    return encontrado;
  });
  console.log("rolesSeleccionados para el formulario:", rolesSeleccionados);

  this.PersonaForm.patchValue({
    idpersona: xdat.idpersona,
    nombre: xdat.nombre,
    ap_materno: xdat.ap_materno,
    ap_paterno: xdat.ap_paterno,
    rol: rolesSeleccionados,
    cedula: xdat.cedula,
    telefono: xdat.telefono,
    direccion: xdat.direccion,
    fotografia: this.nombreImagenExistente = xdat.fotografia || '',
    fecha: xdat.fecha,
    hora: xdat.hora,
    correo: xdat.correo,
    genero: Selegenero,
    estado: xdat.estado,
  });

  console.log("Form patchValue completado:", this.PersonaForm.value);
}

 modificarPersona() {
   this.loadingSave = true;
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
loadingSave = false;

modificarDatosPersona(nombreImagen: string) {
    const rolselect = this.PersonaForm.get('rol')?.value as Rol[];
    const genero = this.PersonaForm.get('genero')?.value as Genero;
    this.xper = {
      cedula: this.PersonaForm.get('cedula')?.value,
      idpersona: this.PersonaForm.get('idpersona')?.value,
      nombre: this.PersonaForm.get('nombre')?.value,
      ap_paterno: this.PersonaForm.get('ap_paterno')?.value,
      ap_materno: this.PersonaForm.get('ap_materno')?.value,
      direccion: this.PersonaForm.get('direccion')?.value,
      telefono: this.PersonaForm.get('telefono')?.value,
      fotografia: nombreImagen,
      fecha: this.PersonaForm.get('fecha')?.value,
      hora: this.PersonaForm.get('hora')?.value,
      genero: genero,
      correo: this.PersonaForm.get('correo')?.value,
      estado: this.PersonaForm.get('estado')?.value,
      rol: rolselect,
    },
  console.log("datos enviando::"+this.xper);
  
    this.PerService
      .ModificarPersona(this.xper)
      .subscribe(() => {
        this.modelPersona();
         this.loadingSave = false;
        this.guardarRegistroPM();
        this.PersonaForm.reset();
      });
  }


  visible: boolean = false;
  
      showDialog() {
          this.visible = true;
      }
  
      guardarRegistro() {
    this.visible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'El registro fue guardado exitosamente.',
      life: 3000
    });
  }
  
  cancelarRegistro() {
    this.visible = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }
  // registrar usuario para cliente
  personaSelect: Persona | null = null;
  modoEditar: boolean = false;

  vistaUser(fall: Persona) {
    this.personaSelect = fall;
   
    const usuarioExistente = this.listaCredencial.find(usuario => usuario.persona?.idpersona === fall.idpersona);
    if (usuarioExistente) {
      
      this.modoEditar = true;
      this.credeForm.get('usuario')?.disable();
      this.credeForm.patchValue({
        usuario: usuarioExistente.usuario,
        
      });
    } else {
      
      this.modoEditar = false;
      this.credeForm.get('usuario')?.enable();
      this.credeForm.patchValue({
        usuario: '',
        contrasena: ''
      });
    }
  } 
   registrarCredencial() {
    console.log("pasooo: ");
      this.xper = {
      usuario: this.credeForm.get('usuario')?.value,
      contrasena: this.credeForm.get('contrasena')?.value,
      persona: this.personaSelect

    },
  
    this.credeService
      .modificarCredencial(this.xper)
      .subscribe(() => {
        this.credeService.listarCredencial().subscribe((fall) => (this.listaCredencial = fall))
        this.credeForm.reset();
      });
  }
             
cambiarEstadoSwitch(value: boolean, persona: Persona) {
  

  this.perInfo = persona.nombre + ' ' + persona.ap_paterno;
  this.modificarEstado = persona;

  if (value === false) {
    this.Eliminar();
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Bloqueado', 
      detail: 'El usuario ha sido bloqueado. No podrá realizar ninguna operación.', 
      life: 3000 
    });

  } else {
    this.Habilitar();
     this.messageService.add({ 
      severity: 'success', 
      summary: 'Habilitado', 
      detail: 'Acceso restaurado. La cuenta ahora está activa.', 
      life: 3000 
    });
  }
}
  perInfo="";
  modificarEstado!: Persona;
  habilitarGuardar = false;
  elimnarGuardar = false;
vistaEstado(fall: Persona) {
  this.perInfo = fall.nombre+' '+fall.ap_paterno;
  this.modificarEstado = fall;
  console.log("ingresa aqui:" + this.perInfo);
  this.habilitarGuardar = this.modificarEstado.estado === 0;
  this.elimnarGuardar = this.modificarEstado.estado === 1;
}

Habilitar() {
  console.log("paso");
  if (this.modificarEstado.estado == 0) {
    this.PerService.cambiarEstadoPersona(this.modificarEstado).subscribe((xper) => {
      this.PerService.ListarPersonas().subscribe((fall) => {
        this.modelPersona();
        })
    });
  }
}
  Eliminar() {
    console.log("paso");
    if (this.modificarEstado.estado == 1) {
      this.PerService.cambiarEstadoPersona(this.modificarEstado).subscribe((xper) => {
       this.PerService.ListarPersonas().subscribe((fall) => {
        this.modelPersona();
        })
      });
    }
  }
  @ViewChild('popupHabilitar') popupHabilitar!: ConfirmPopup;
@ViewChild('popupBloquear') popupBloquear!: ConfirmPopup;

 bloquear(event: Event, persona: any) {
  this.perInfo = persona.nombre;
  this.confirmationService.confirm({
    target: event.target as HTMLElement,
    message: `¿Estás seguro de bloquear la cuenta de: ${this.perInfo}?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Bloquear',
    rejectLabel: 'Cancelar',
    key: 'popupBloquear',
    accept: () => {
      this.messageService.add({ severity: 'info', summary: 'Bloqueado', detail: 'El usuario ha sido bloqueado. No podrá realizar ninguna operación.', life: 3000 });
      this.Eliminar();
     
    },
     reject: () => {
      this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'No se realizó ninguna acción.', life: 3000 });
    }

  });
}

habilitar(event: Event, persona: any) {
  this.perInfo = persona.nombre;
  this.confirmationService.confirm({
    target: event.target as HTMLElement,
    message: `¿Estás seguro de habilitar la cuenta de: ${this.perInfo}?`,
    icon: 'pi pi-check-circle',
    acceptLabel: 'Activar',
    rejectLabel: 'Cancelar',
    key: 'popupHabilitar',
    accept: () => {
      this.messageService.add({ severity: 'success', summary: 'Habilitado', detail: 'Acceso restaurado. La cuenta ahora está activa.', life: 3000 });
      this.Habilitar();
    },
     reject: () => {
      this.messageService.add({ severity: 'warn', summary: 'Cancelado', detail: 'No se realizó ninguna acción.', life: 3000 });
    }
  });
}


// ver datelles persona
personaSeleccionada: any = null;
visible3: boolean = false;

mostrarDetallesPersona(id: number): void {
  this.PerService.VerDetallesPersona(id).subscribe({
    next: (data) => {
      console.log('Datos recibidos:', data);  // 🔍 Aquí se ve todo lo que llega desde el backend
      this.personaSeleccionada = data;
      this.visible3 = true;
    },
    error: (err) => {
      console.error('Error al obtener detalles de la persona', err);
    }
  });
}


  mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}



}