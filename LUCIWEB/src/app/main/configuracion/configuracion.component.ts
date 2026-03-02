import { Component, OnInit, ViewChild , ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Sistema } from 'src/app/model/sistema';
import { SistemaService } from 'src/app/servicio/sistema.service';
import { Ciudad } from 'src/app/model/ciudad';
import { CuidadService } from 'src/app/servicio/ciudad.service';
import * as L from 'leaflet';
import { Genero } from 'src/app/model/genero';
import { forkJoin } from 'rxjs';
import { Auditoria } from 'src/app/model/auditoria';




@Component({
  selector: 'app-configuracion',
 imports: [ProgressSpinnerModule, FieldsetModule,AvatarModule,SplitterModule, TooltipModule, InputSwitchModule, NgxPaginationModule, RadioButtonModule, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
      providers: [ConfirmationService, MessageService],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent {

  activeTab = 'perfil';
listaPersona: Persona[] = [];
listaRol: Rol[]= [];
listaCiudad: Ciudad[]=[];
listaCredencial: Credencial[]=[];
listaSistema: Sistema[]=[];

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
    sisForm: any = new FormGroup({
       idnegocio: new FormControl(''),
       direccion: new FormControl('', Validators.required),
       telefono: new FormControl('',Validators.required),
       long: new FormControl(''),
       lat: new FormControl(''),
       ciudad: new FormControl('',Validators.required),
    })
      PersonaForm: any = new FormGroup({
      idpersona: new FormControl(''),
      cedula: new FormControl('',Validators.required),
      nombre: new FormControl('',Validators.required),
      ap_paterno: new FormControl('',Validators.required),
      ap_materno: new FormControl(''),
      telefono: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required),
      fotografia: new FormControl(''), 
      fecha: new FormControl(''),
      hora: new FormControl(''),
      correo: new FormControl('', Validators.required),
      genero: new FormControl(''),
      estado: new FormControl(''),
      rol: new FormControl([])
    });

     constructor( private serciudad: CuidadService, private serSistema: SistemaService, private confirmationService: ConfirmationService, private messageService: MessageService,
    private PerService: PersonaService, private credeService: CredencialService,
     private rolService: RolService,  private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }
  loading: boolean = false;
  modelPersona() {
    this.loading = true;
  this.PerService.ListarPersonas().subscribe((fall) => {
    this.listaPersona = fall.filter(p => p.rol?.some(r => r.idrol === 1));
    this.xper = this.listaPersona[0];
    this.vistaModPersona(this.xper);    
    this.loading = false;
  });
}
 modelCredencial() {
    this.credeService.listarCredencial().subscribe((fall) =>{
       this.listaCredencial = fall;
       this.xper= this.listaCredencial[0];
       this.vistaUser(this.xper);
      }) 
  }
listaGenero: Genero[]=[];
  modelGenero() {
    this.PerService.ListarGenero().subscribe((fall) => (this.listaGenero = fall)) 
    this.vistaModPersona(this.xper);
  }
   loading1: boolean = false; 
 modelSistema() {
  this.loading1 = true;
  this.serSistema.ListarSistema().subscribe((fall) => {
    this.listaSistema = fall;
   
    this.xsis = this.listaSistema[0];

    this.modelCuidad(() => {
      this.vistaSistema(this.xsis); 
    });
    setTimeout(() => {
      this.vistaSistema(this.xsis);
    }, 600);
  });
  this.loading1 = false;
}

modelCuidad(callback?: () => void) {
  this.serciudad.ListarCuidad().subscribe((fall) => {
    this.listaCiudad = fall;
    if (callback) callback(); 
  });
}
listaAuditoria: Auditoria[]=[]; 

 modelAuditoria() {
  
 this.serSistema.ListarAuditoria().subscribe((res) => {
 
    this.listaAuditoria = res;
   
   });
}
ngOnInit(): void {
  this.loading = true;

  forkJoin({
    generos: this.PerService.ListarGenero(),
    roles: this.rolService.ListarRol(),
    personas: this.PerService.ListarPersonas()
  }).subscribe(({ generos, roles, personas }) => {
    this.listaGenero = generos;
    this.listaRol = roles;
    this.listaPersona = personas.filter(p => p.rol?.some(r => r.idrol === 1));
    this.xper = this.listaPersona[0];

    this.vistaModPersona(this.xper);
    this.loading = false;
  });
  this.modelAuditoria();
  this.modelCredencial();
  this.modelSistema();    
  this.modelCuidad();
}
xper!: any;
nombreImagenExistente: string = '';
vistaModPersona(xdat: Persona) { 
  const Selegenero= this.listaGenero.find(c => c.idgenero === xdat.genero?.idgenero) || null;
 const rolesPersona: Rol[] = Array.isArray(xdat.rol) ? xdat.rol : xdat.rol ? [xdat.rol] : [];
   console.log("rolesPersona (convertido a array):", rolesPersona);
 
   // Seleccionamos los roles de la lista completa que estén asignados a la persona
   const rolesSeleccionados = this.listaRol.filter(r => {
     const encontrado = rolesPersona.some(xr => xr.idrol === r.idrol);
     console.log(`Revisando rol ${r.nombre} (id: ${r.idrol}) => encontrado:`, encontrado);
     return encontrado;
   });
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
  })
   console.log("📋 Datos originales (xdat):", xdat);
  console.log("🎯 Género seleccionado:", Selegenero);
  console.log("✅ Roles seleccionados:", rolesSeleccionados);
  console.log("🧾 Valores finales del formulario:", this.PersonaForm.value);
}
guardarPersona() {
  this.messageService.add({
    severity: 'info',
    summary: 'Actualizado',
    detail: 'Los Cambios se actulizaron de manera correcta',
    life: 3000
  });
}

map: any;
marker: any;
private mapaInicializado = false;

ngAfterViewChecked(): void {
  if (this.mapContainer && !this.mapaInicializado) {
    this.mapaInicializado = true;
    setTimeout(() => {
      this.initMap();
    }, 0);
  }
}

@ViewChild('mapContainer') mapContainer: any;

initMap(): void {
  console.log("Intentando inicializar el mapa...");

  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('⚠️ El elemento con id="map" no existe en el DOM.');
    return;
  }

  console.log('✅ El div #map existe. Inicializando mapa...');

  this.map = L.map('map').setView([-21.537, -64.729], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  console.log('🗺️ Tile layer añadido al mapa.');

  this.map.on('click', (e: any) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    console.log(`📍 Clic en el mapa: lat=${lat}, lng=${lng}`);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);

    this.sisForm.patchValue({
      lat: lat,
      long: lng
    });
  });

  this.mapaInicializado = true; // Marca el mapa como inicializado

  // Si ya hay lat y long en el formulario, mostrar marcador automáticamente
  const lat = this.sisForm.get('lat')?.value;
  const lng = this.sisForm.get('long')?.value;
  if (lat && lng) {
    this.vistaSistema(this.sisForm.value);
  }

  console.log('✅ Mapa completamente inicializado.');
}


xsis!: any;
vistaSistema(xdat: Sistema) {
  if (!xdat) return;

  const selecCiudad = this.listaCiudad.find(c => c.idciudad === xdat.ciudad?.idciudad) || null;

  // Actualizar el formulario sin disparar eventos
  this.sisForm.patchValue({
    idnegocio: xdat.idnegocio,
    direccion: xdat.direccion,
    telefono: xdat.telefono,
    long: xdat.long,
    lat: xdat.lat,
    ciudad: selecCiudad,
  }, { emitEvent: false });

  if (xdat.lat && xdat.long && this.map) {
    this.map.setView([xdat.lat, xdat.long], 13);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([xdat.lat, xdat.long]).addTo(this.map);
  }
}



modificarSistema(){
   const selectCuidad = this.sisForm.get('ciudad')?.value as Ciudad;
   this.xsis = {
    idnegocio: this.sisForm.get('idnegocio')?.value,
    direccion: this.sisForm.get('direccion')?.value,
    telefono: this.sisForm.get('telefono')?.value,
     lat: this.sisForm.get('lat')?.value,
  long: this.sisForm.get('long')?.value,
    ciudad: selectCuidad,
   },
   console.log("enviando dats.",this.xsis);
   
   this.serSistema.ModificarSistema
   (this.xsis)
      .subscribe(() => {
       this.modelSistema();
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
    const selecgenero = this.PersonaForm.get('genero')?.value as Genero;
    
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
      genero: selecgenero,
      correo: this.PersonaForm.get('correo')?.value,
      estado: this.PersonaForm.get('estado')?.value,
      rol:  [ { idrol: 1, nombre: "Administrador" } ]
    },
  console.log("datos enviando::",this.xper);
  
    this.PerService
      .ModificarPersona(this.xper)
      .subscribe(() => {
        this.PerService.ListarPersonas().subscribe((fall) => {
        this.modelPersona(); 
        }),
        this.PersonaForm.reset();
      });
  }

vistaUser(fall: Persona) {
    const usuarioExistente = this.listaCredencial.find(usuario => usuario.persona?.idpersona === fall.idpersona);
    if (usuarioExistente) {
      console.log("Usuario ya registrado", usuarioExistente);
     
      this.credeForm.get('usuario')?.disable();
      this.credeForm.patchValue({
      usuario: usuarioExistente.usuario,
        
      });
    }
  } 
   registrarCredencial() {
    console.log("pasooo: ");
      this.xper = {
      usuario: this.credeForm.get('usuario')?.value,
      contrasena: this.credeForm.get('contrasena')?.value,
      persona: this.credeForm.get('persona')?.value,

    },
  console.log("datos correctos enviados:: ",this.xper);
    this.credeService
      .modificarCredencial(this.xper)
      .subscribe(() => {
        this.credeService.listarCredencial().subscribe((fall) => (this.listaCredencial = fall))
        this.credeForm.reset();
      });
  }

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
}

