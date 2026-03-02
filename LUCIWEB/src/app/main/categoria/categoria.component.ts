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

@Component({
  selector: 'app-categoria',
       imports: [ProgressSpinnerModule, NgxPaginationModule,Dialog, SplitterModule, FieldsetModule,AvatarModule, MessageModule, MessagesModule, ConfirmDialog, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
            providers: [ConfirmationService, MessageService],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent {
  nombreUso(): boolean {
  const nom = this.cataForm.get('nombre')?.value;
  if (!nom) return false;
  const nomLower = nom.toLowerCase(); 
  return this.listaCategoria.some(
    (p) => p.nombre.toLowerCase() === nomLower 
  );
}
  pag=1;
    xper!: any;
       listaCategoria: Categoria[]=[];
  
        cataForm: any = new FormGroup({
          idcategoria: new FormControl(''),
           nombre: new FormControl('', [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(40),
              Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
            ]),
            descripcion: new FormControl('', [
              Validators.minLength(7),
              Validators.maxLength(80)
            ]),
          fecha: new FormControl(''),
          hora: new FormControl(''),
          estado: new FormControl('1'),
        })
        
constructor(private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService) {}
loading: boolean = false;    
 modelCategoria() {
  this.loading = true;
  this.cateService.ListarCategoria().subscribe((fall) => {
    this.listaCategoriaOriginal = fall.sort((a, b) => b.idcategoria - a.idcategoria);
    this.listaCategoria = [...this.listaCategoriaOriginal]; // copia inicial
    this.loading = false;
  });
}

filtrarPorTipo() {
  if (this.tipoFiltro === 'todos') {
    this.listaCategoria = [...this.listaCategoriaOriginal];
  } else {
    const estadoNum = Number(this.tipoFiltro);
    this.listaCategoria = this.listaCategoriaOriginal.filter(cat => cat.estado === estadoNum);
  }
}
tipoFiltro: string = 'todos';
listaCategoriaOriginal: any[] = []; 
    ngOnInit(): void {
    
      this.modelCategoria();
    }
    filtro: string = ''; 
    buscar() {
      if (this.filtro.trim()) {
        this.cateService.buscarCategorias(this.filtro).subscribe((fall) => {
          this.listaCategoria =  fall.sort((a, b) => b.idcategoria - a.idcategoria);
        });
      } else {
        this.modelCategoria(); 
      }
  
    }
   
  registrarCategoria() {
     this.loadingSave = true;
        const fecha = new Date();
        const hora = fecha.toTimeString().split(' ')[0];
      this.xper = {
        nombre: this.cataForm.get('nombre')?.value,
        descripcion: this.cataForm.get( 'descripcion')?.value,
        fecha: fecha,
        hora: hora,
        estado: this.cataForm.get('estado')?.value,
  
      },
  
      this.cateService
        .RegistrarCategoria(this.xper)
        .subscribe(() => {
          this.modelCategoria();
           this.loadingSave =false;
           this.guardarRegistro();
          this.cataForm.reset();
        });
    }
  
  // modificar proveedor
  vistaCategoria(xdat: Categoria) {
    this.cataForm.patchValue({
      idcategoria: xdat.idcategoria,
      nombre: xdat.nombre,
      descripcion: xdat.descripcion,
      fecha: xdat.fecha,
      hora: xdat.hora,
      estado: xdat.estado
    })
  }
  loadingSave = false;
  modificarCategoria() {
  this.loadingSave = true;
      this.xper = {
        idcategoria: this.cataForm.get('idcategoria')?.value,
        nombre: this.cataForm.get('nombre')?.value,
        descripcion: this.cataForm.get('descripcion')?.value,
        fecha: this.cataForm.get('fecha')?.value,
        hora: this.cataForm.get('hora')?.value,
        estado: this.cataForm.get('estado')?.value,
      },
  
      this.cateService
        .ModificarCategoria(this.xper)
        .subscribe(() => {
          this.modelCategoria();
          this.loadingSave = false;
          this.guardarRegistroP();
          this.cataForm.reset();
        });
    }
  
  
  
  
  
  
  
   perInfo = '';
    eliminarNegocio!: Categoria;
    vistaEliminar(fall: Categoria){
      this.perInfo = fall.nombre;
      this.eliminarNegocio = fall;
      
    }
    
    Eliminarcate() {
    if (this.eliminarNegocio && this.eliminarNegocio.idcategoria) {
      this.cateService.eliminarCategoria(this.eliminarNegocio.idcategoria).subscribe({
        next: () => {
          this.modelCategoria();
          this.messageService.add({
            severity: 'success',
            summary: '¡Eliminación exitosa!',
            detail: `${this.perInfo} fue eliminado correctamente.`,
            life: 3000
          });
        },
        error: (err) => {
          console.error('Error al eliminar Categoria:', err);
  
          this.messageService.add({
            severity: 'error',
            summary: 'Error al eliminar',
            detail: 'No se puede eliminar este categoria porque ya está siendo usado en un catalogo.',
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
  
  
  