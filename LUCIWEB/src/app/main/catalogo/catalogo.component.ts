import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Catalogo } from 'src/app/model/catalogo';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { NgxPaginationModule } from 'ngx-pagination';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Categoria } from 'src/app/model/categoria';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-catalogo',
     imports: [DropdownModule, ProgressSpinnerModule, InputSwitchModule,RadioButtonModule, NgxPaginationModule, SplitterModule, FieldsetModule,AvatarModule,ConfirmDialog , MenuModule, ToastModule, Dialog, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
      providers: [ConfirmationService, MessageService],
      
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent {

  listaCatalogo: Catalogo[]=[];
  listaCategoria: Categoria[]=[];
cataForm: any = new FormGroup({
  idcatalogo: new FormControl(''),
  nombre: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(80),
  ]),
  descripcion: new FormControl('', [
    Validators.minLength(5),
    Validators.maxLength(100)
  ]),
  fotografia: new FormControl('', [Validators.required, this.validarFormatoImagen]),
  fecha: new FormControl(''),
  hora: new FormControl(''),
  destacado: new FormControl(0),
  precio: new FormControl('', [
    Validators.required,
    Validators.pattern(/^[1-9][0-9]{0,3}$/) // Solo enteros de 1 a 9999
  ]),
  categoria: new FormControl('', Validators.required),
  estado: new FormControl('')
});


  constructor(private cateService: CategoriaService,  private serviceCatalogo: CatalogoService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  loading: boolean = false;
modelCatalogo() {
  this.loading= true
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
  
    this.listaCatalogo = fall.sort((a, b) => b.idcatalogo - a.idcatalogo);
   
    this.loading= false
  });
}

modelCategoria() {
  this.cateService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria = fall.filter(p => p.estado === 1);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
  });
}
ngOnInit(): void {
   this.modelCatalogo();
   this.modelCategoria();
}
esNuevo(fecha: string, hora: string): boolean {
  if (!fecha || !hora) return false;
  const fechaHoraStr = `${fecha}T${hora}`; 
  const fechaHoraRegistro = new Date(fechaHoraStr);
  const ahora = new Date();
  const diferenciaEnMs = ahora.getTime() - fechaHoraRegistro.getTime();
  const horas = diferenciaEnMs / (1000 * 60 * 60);
  return horas <=8;
}


filtroDestacado: number | string = 'todos';
filtroTipo: number | string = 'todos';
buscarPorDestacado() {
  if (this.filtroDestacado === 'todos') {
    this.modelCatalogo();
  } else {
    const destacado = Number(this.filtroDestacado);
    this.serviceCatalogo.filtrarPorDestacado(destacado).subscribe(data => {
      this.listaCatalogo = data;
    });
  }
}

buscarPorTipo() {
  if (this.filtroTipo === 'todos') {
    this.modelCatalogo();
  } else {
    const tipo = Number(this.filtroTipo);
    this.serviceCatalogo.filtrarPorTipo(tipo).subscribe(data => {
      this.listaCatalogo = data;
    });
  }
}


modalImagenVisible: boolean = false;
imagenSeleccionadaModal: string = '';

verImagen(nombreImagen: string) {
  this.imagenSeleccionadaModal = nombreImagen;
  this.modalImagenVisible = true;
}

validarFormatoImagen(control: AbstractControl): ValidationErrors | null {
  const file = control.value;
  if (!file) return { requerido: true };

  let fileName = '';

  if (file instanceof File) {
    fileName = file.name;
  } else if (typeof file === 'string') {
    fileName = file;
  }

  const extensionesPermitidas = /\.(jpg|jpeg|png)$/i;
  return extensionesPermitidas.test(fileName) ? null : { formatoInvalido: true };
}


 nombreYaRegistrada(): boolean {
  const nom = this.cataForm.get('nombre')?.value;
  if (!nom) return false;
  const nomLower = nom.toLowerCase(); 
  return this.listaCatalogo.some(
    (p) => p.nombre.toLowerCase() === nomLower 
  );
}

cantidadVisible = 8; 

mostrarMas(): void {
  this.cantidadVisible += 8; 
}


imagenSeleccionada!: File;

onFileSelected(event: any) {
  const file: File = event.target.files[0];

  if (file) {
    this.imagenSeleccionada = file;

    // Asignamos el archivo al form control y disparamos validación
    this.cataForm.get('fotografia')?.setValue(file);
    this.cataForm.get('fotografia')?.markAsTouched();
    this.cataForm.get('fotografia')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
     
    };
    reader.readAsDataURL(file);
  } else {
    // Si no se selecciona archivo
    this.cataForm.get('fotografia')?.setValue(null);
    this.cataForm.get('fotografia')?.markAsTouched();
    this.cataForm.get('fotografia')?.updateValueAndValidity();
  }
}

// regitrar catalogo
xper!: any

registrarCatalogo() {
   this.loadingSave = true;
 
  if (this.imagenSeleccionada) {
    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    this.serviceCatalogo.SubirImagen(formData).subscribe({
      next: (resp) => {
        const nombreImagen = resp.nombre;
        this.guardarDatosCatalogo(nombreImagen);
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
      }
    });
  } else {
    // Si no se seleccionó imagen, se puede continuar sin imagen o mostrar error
    this.guardarDatosCatalogo('');
  }
}

guardarDatosCatalogo(nombreImagen: string) {
  const fechaSele = new Date();
  const horaSele = fechaSele.toTimeString().split(' ')[0];
  const tiposeleccionado = this.cataForm.get('categoria')?.value as Categoria;
  this.xper = {
    nombre: this.cataForm.get('nombre')?.value,
    descripcion: this.cataForm.get('descripcion')?.value,
    fotografia: nombreImagen,
    precio: this.cataForm.get('precio')?.value,
    destacado: this.cataForm.get('destacado')?.value,
    fecha: fechaSele,
    hora: horaSele,
    categoria: tiposeleccionado,
    estado: 1,
  };



  this.serviceCatalogo.RegistrarCatalogo(this.xper).subscribe(() => {
    this.modelCatalogo();
     this.loadingSave = false;
     this.guardarRegistro();
    this.cataForm.reset();
    // this.imagenSeleccionada = undefined;
  });
}

// modificar catalogo
nombreImagenExistente: string = '';
vistaCatalogo(xdat: Catalogo) { 
  const Seleccionada = this.listaCategoria.find(c => c.idcategoria === xdat.categoria?.idcategoria) || null;
  this.cataForm.patchValue({
    idcatalogo: xdat.idcatalogo,
    nombre: xdat.nombre,
    hora: xdat.hora,
    fecha: xdat.fecha,
    estado: xdat.estado,
    descripcion: xdat.descripcion,
    destacado: xdat.destacado,
    categoria: Seleccionada,
    precio: xdat.precio,
    fotografia: this.nombreImagenExistente = xdat.fotografia || '',
  })
}
modificarCatalogo() {
 this.loadingSave = true;
  if (this.imagenSeleccionada) {
    const formData = new FormData();
    formData.append('imagen', this.imagenSeleccionada);

    this.serviceCatalogo.SubirImagen(formData).subscribe({
      next: (resp) => {
        const nombreImagen = resp.nombre;
        this.modificarDatosCatalogo(nombreImagen);
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
      }
    });
  } else {
    // Si no se seleccionó imagen, se puede continuar sin imagen o mostrar error
    this.modificarDatosCatalogo(this.nombreImagenExistente);
  }
}

modificarDatosCatalogo(nombreImagen: string) {
  const tiposeleccionado = this.cataForm.get('categoria')?.value as Categoria;
  this.xper = {
    idcatalogo: this.cataForm.get('idcatalogo')?.value,
    nombre: this.cataForm.get('nombre')?.value,
    descripcion: this.cataForm.get('descripcion')?.value,
    fotografia: nombreImagen,
    precio: this.cataForm.get('precio')?.value,
    destacado: this.cataForm.get('destacado')?.value,
    fecha: this.cataForm.get('fecha')?.value,
    hora: this.cataForm.get('hora')?.value,
    categoria: tiposeleccionado,
    estado: this.cataForm.get('estado')?.value,
  };



  this.serviceCatalogo.ModificarCatalogo(this.xper).subscribe(() => {
    this.modelCatalogo();
     this.loadingSave = false;
     this.guardarMod();
    this.cataForm.reset();
    // this.imagenSeleccionada = undefined;
  });
}
loadingSave = false;

// buscar catalogo
  filtro: string = ''; 
  buscarCatalogo() {
  if (this.filtro.trim()) {
    this.serviceCatalogo.buscarCatalogo(this.filtro).subscribe((result) => {
      this.listaCatalogo = result;
    });
  } else {
    this.modelCatalogo(); 
  }
}

// cambiar estado persona
cambiarEstadoSwitch(value: boolean, persona: Catalogo) {
  

  this.perInfo = persona.nombre;
  this.modificarEstado = persona;

  if (value === false) {
    this.Eliminar();
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Catálogo deshabilitado', 
      detail: 'No estará disponible ni para pedidos ni visualización.', 
      life: 5000 
    });

  } else {
    this.Habilitar();
     this.messageService.add({ 
      severity: 'success', 
      summary: 'Catalogo Habilitado', 
      detail: 'Disponible para pedidos y visualización.', 
      life: 5000 
    });
  }
}
  perInfo="";
  modificarEstado!: Catalogo;
  habilitarGuardar = false;
  elimnarGuardar = false;
vistaEstado(fall: Catalogo) {
  this.perInfo = fall.nombre;
  this.modificarEstado = fall;
  console.log("ingresa aqui:" + this.perInfo);
  this.habilitarGuardar = this.modificarEstado.estado === 0;
  this.elimnarGuardar = this.modificarEstado.estado === 1;
}

Habilitar() {
  console.log("paso");
  if (this.modificarEstado.estado == 0) {
    this.serviceCatalogo.cambiarEstadoCatalogo(this.modificarEstado).subscribe((xper) => {
       this.modelCatalogo(); 
    });
  }
}
  Eliminar() {
    console.log("paso");
    if (this.modificarEstado.estado == 1) {
      this.serviceCatalogo.cambiarEstadoCatalogo(this.modificarEstado).subscribe((xper) => {
       this.modelCatalogo(); 
      });
    }
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
     this.cataForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }

  visible1: boolean = false;
  
      showDialog1() {
          this.visible1 = true;
      }
  
      guardarMod() {
    this.visible1 = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Los datos se Actualizo exitosamente.',
      life: 3000
    });
  }
  
  cancelarMod() {
    this.visible1 = false;
     this.cataForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }
    mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}
}
