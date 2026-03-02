
import { Producto } from 'src/app/model/producto';
import { ProductoService } from 'src/app/servicio/producto.service';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Proveedor } from 'src/app/model/proveedor';
import { ProveedorService } from 'src/app/servicio/proveedor.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { CuidadService } from 'src/app/servicio/ciudad.service';
import { Ciudad } from 'src/app/model/ciudad';
import { Persona } from 'src/app/model/persona';
import { PersonaService } from 'src/app/servicio/persona.service';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Categoria } from 'src/app/model/categoria';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
@Component({
  selector: 'app-producto',
    imports: [DropdownModule, ProgressSpinnerModule, NgxPaginationModule,Dialog, SplitterModule, FieldsetModule,AvatarModule, MessageModule, MessagesModule, ConfirmDialog, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
              providers: [ConfirmationService, MessageService],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  nombreUso(): boolean {
  const nom = this.cataForm.get('nombre')?.value;
  if (!nom) return false;
  const nomLower = nom.toLowerCase(); 
  return this.listaProducto.some(
    (p) => p.nombre.toLowerCase() === nomLower 
  );
}

pag=1;
listaProducto: Producto[]=[];
  listaCategoria: Categoria[]=[];
cataForm: any = new FormGroup({
  idproducto: new FormControl(''),
  nombre: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(40),
    Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
  ]),
  descripcion: new FormControl('', [
    Validators.minLength(5),
    Validators.maxLength(80)
  ]),
  fecha: new FormControl(''),
  hora: new FormControl(''),
  categoria: new FormControl('', Validators.required),
 
});


  constructor(private cateService: CategoriaService,  private prodService: ProductoService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  
loading: boolean = false;
modelProducto() {
  this.loading = true;
  this.prodService.ListarProducto().subscribe((fall) => {
    this.listaProducto = fall.sort((a, b) => b.idproducto - a.idproducto);
   
    this.loading = false;
    
  });
}

modelCategoria() {
  this.cateService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria =fall.filter(p => p.estado === 0);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
  });
}
ngOnInit(): void {
   this.modelProducto();
   this.modelCategoria();
}

filtroTipo: number | string = 'todos';

FiltrarProductocategoria() {
  if (this.filtroTipo === 'todos') {
    this.modelProducto();
  } else {
    const tipo = Number(this.filtroTipo);
    this.prodService.filtrarProductocategoria(tipo).subscribe(data => {
      this.listaProducto = data;
    });
  }
}

filtro: string = ''; 
    buscar() {
      if (this.filtro.trim()) {
        this.prodService.buscarProducto(this.filtro).subscribe((fall) => {
          this.listaProducto = fall.sort((a, b) => b.idproducto - a.idproducto);
        });
      } else {
        this.modelProducto(); 
      }
  
    }
   xper!: any
   loadingSave = false;

  registrarProducto() {
     this.loadingSave = true;
        const fecha = new Date();
        const hora = fecha.toTimeString().split(' ')[0];
        const tiposeleccionado = this.cataForm.get('categoria')?.value as Categoria;
      this.xper = {
        nombre: this.cataForm.get('nombre')?.value,
        descripcion: this.cataForm.get('descripcion')?.value,
        fecha: fecha,
        hora: hora,
        categoria: tiposeleccionado,

  
      },
  
      this.prodService
        .RegistrarProducto(this.xper)
        .subscribe(() => {
          this.modelProducto();
           this.loadingSave = false;
           this.guardarRegistro();
          this.cataForm.reset();
        });
    }
  
  // modificar proveedor
  vistaProducto(xdat: Producto) {
    const Seleccionada = this.listaCategoria.find(c => c.idcategoria === xdat.categoria?.idcategoria) || null;
    this.cataForm.patchValue({
      idproducto: xdat.idproducto,
      nombre: xdat.nombre,
      descripcion: xdat.descripcion,
      fecha: xdat.fecha,
      hora: xdat.hora,
      categoria: Seleccionada,
    })
  }
  
  modificarProducto() {
     this.loadingSave = true;
  const tiposeleccionado = this.cataForm.get('categoria')?.value as Categoria;
      this.xper = {
        idproducto: this.cataForm.get('idproducto')?.value,
        nombre: this.cataForm.get('nombre')?.value,
        descripcion: this.cataForm.get('descripcion')?.value,
        fecha: this.cataForm.get('fecha')?.value,
        hora: this.cataForm.get('hora')?.value,
        categoria: tiposeleccionado,
      },
  
      this.prodService
        .ModificarProducto(this.xper)
        .subscribe(() => {
          this.modelProducto();
           this.loadingSave = false;
           this.guardarRegistroP();
          this.cataForm.reset();
        });
    }
  
  
  
  
  
  
  
   perInfo = '';
    eliminarNegocio!: Producto;
    vistaEliminar(fall: Producto){
      this.perInfo = fall.nombre;
      this.eliminarNegocio = fall;
      
    }
    
    Eliminarcate() {
    if (this.eliminarNegocio && this.eliminarNegocio.idproducto) {
      this.prodService.eliminarProducto(this.eliminarNegocio.idproducto).subscribe({
        next: () => {
          this.modelProducto();
          this.messageService.add({
            severity: 'success',
            summary: '¡Eliminación exitosa!',
            detail: `${this.perInfo} fue eliminado correctamente.`,
            life: 3000
          });
        },
        error: (err) => {
          console.error('Error al eliminar Producto:', err);
  
          this.messageService.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'No se puede eliminar este producto porque ya está siendo usado en una compra.',
            life: 4000
          });
        }
      });
    }
  }
  
  confirm2(event: Event) {
          this.confirmationService.confirm({
              target: event.target as EventTarget,
             message: `¿Estás seguro de eliminar: ${this.perInfo}?`,
              header: 'Confirmar Eliminacion',
              icon: 'pi pi-info-circle',
              rejectLabel: 'Cancel',
              rejectButtonProps: {
                  label: 'Cancelar',
                  severity: 'secondary',
                  outlined: true,
              },
              acceptButtonProps: {
                  label: 'Eliminar',
                  severity: 'danger',
              },
  
              accept: () => {
                this.Eliminarcate(); 
                
               },
             reject: () => {
                this.messageService.add({severity: 'warn', summary: 'Operación cancelada', detail: `No se eliminó ${this.perInfo}.`,
             life: 3000
             });
              }
  
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
  
    visibleP: boolean = false;
    
        showDialogP() {
            this.visibleP = true;
        }
    
        guardarRegistroP() {
      this.visibleP = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Los Datos se Actualizo exitosamente.',
        life: 3000
      });
    }
    
    cancelarRegistroP() {
      this.visibleP = false;
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
  
  
  