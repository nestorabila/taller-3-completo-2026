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
import { saveAs } from 'file-saver';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-proveedor',
    imports: [ProgressSpinnerModule , NgxPaginationModule, SplitterModule, FieldsetModule,AvatarModule, MessageModule, MessagesModule, ConfirmDialog, ReactiveFormsModule, FormsModule, Dialog, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
    providers: [ConfirmationService, MessageService],
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.css'
})
export class ProveedorComponent {
pag=1;
  xper!: any;
     listaProveedor: Proveedor[]=[];
    listaCiudad: Ciudad[] =[];
    listaPersona: Persona[] = [];

      proveForm: any = new FormGroup({
        idproveedor: new FormControl(''),
        telefono: new FormControl('', [Validators.minLength(7),Validators.maxLength(20), Validators.pattern(/^[\+\-]?[0-9\-]+$/)]),
        razon_social: new FormControl('', [Validators.required,Validators.minLength(3), Validators.maxLength(50),Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]+$/)]),
        direccion: new FormControl('', [ Validators.required,Validators.minLength(3),Validators.maxLength(100)]),
        fecha: new FormControl(''),
        hora: new FormControl(''),
        nit: new FormControl('',[Validators.pattern(/^[\+\-]?[0-9\-]+$/)]),
        estado: new FormControl(''),
        persona:new FormControl('',Validators.required),
        ciudad: new FormControl('',Validators.required),
      })
      
   constructor(private PerService: PersonaService, private cuidadService: CuidadService,private proveService: ProveedorService, private confirmationService: ConfirmationService, private messageService: MessageService) {}
  encargadoYaUsado(): boolean {
  const personaSel = this.proveForm.get('persona')?.value;
  if (!personaSel) return false;

  return this.listaProveedor.some(
    (p) => p.persona?.idpersona === personaSel.idpersona
  );
}

telefonoUsado(): boolean {
  const cedulaIngresada = this.proveForm.get('telefono')?.value;
  if (!cedulaIngresada) return false;

  return this.listaProveedor.some(
    (p) => p.telefono == cedulaIngresada
  );
}
nitUsado(): boolean {
  const cedulaIngresada = this.proveForm.get('nit')?.value;
  if (!cedulaIngresada) return false;

  return this.listaProveedor.some(
    (p) => p.nit == cedulaIngresada
  );
}

razonUsado(): boolean {
  const cedulaIngresada = this.proveForm.get('razon_social')?.value;
  if (!cedulaIngresada) return false;

  return this.listaProveedor.some(
    (p) => p.razon_social.toLowerCase().trim() == cedulaIngresada.toLowerCase()
  );
}
loading: boolean = false;

modelProveedor() {
  this.loading = true;
  this.proveService.ListarProveedor().subscribe({
    next: (fall) => {
      this.listaProveedor = fall;
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });
}

  modelCiudad() {
   this.cuidadService.ListarCuidad().subscribe((res) => {
    this.listaCiudad = res;
  });
}
modelPersona() {
  this.PerService.ListarPersonas().subscribe((fall) => {
    this.listaPersona = fall.filter(p => p.estado === 1 && p.rol?.some(r => r.idrol === 5));

  });
}
exportarPDF() {
  const doc = new jsPDF('p', 'pt', 'a4');
  const fechaHora = new Date().toLocaleString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ========= FECHAS (IDÉNTICO A PAGOS) =========
  const fechas: string[] = [];
  this.listaProveedor.forEach((xdat: any) => {
    if (xdat.fecha) fechas.push(xdat.fecha.toString());
  });

  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // ================= TABLA (NO SE TOCA) =================
  const columnas = ['#', 'Encargado', 'Razón Social', 'Nit', 'Teléfono', 'Dirección', 'Fecha Registro'];

  const filas = this.listaProveedor.map((xdat: any, index: number) => [
    index + 1,
    `${xdat.persona?.nombre || ''} ${xdat.persona?.ap_paterno || ''} ${xdat.persona?.ap_materno || ''}`.trim(),
    xdat.razon_social,
    xdat.nit || 'no registrado',
    xdat.telefono || 'Sin teléfono',
    `${xdat.ciudad?.nombre || ''} - ${xdat.direccion || ''}`,
    `${xdat.fecha?.split('-').reverse().join('/') || ''} ${xdat.hora || ''}`

  ]);

  autoTable(doc, {
    startY: 150,
    head: [columnas],
    body: filas,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },

    didDrawPage: (data) => {

      // ======== ENCABEZADO (IDÉNTICO A PAGOS) ========
      if (data.pageNumber === 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('REPORTE DE PROVEEDORES', pageWidth / 2, 40, { align: 'center' });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.text(
          '“Estos son los reportes de los pagos según el seguimiento realizado”',
          pageWidth / 2,
          60,
          { align: 'center' }
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(
          `Informe correspondiente al período del: ${minFechaFormatted}   al: ${maxFechaFormatted}`,
          40,
          85
        );

        doc.setDrawColor(0);
        doc.setLineWidth(1.2);
        doc.line(40, 115, pageWidth - 40, 115);
      }

      // ======== PIE (IDÉNTICO A PAGOS) ========
      if (data.pageNumber === doc.getNumberOfPages()) {
        const footerY = pageHeight - 30;

        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(`Página ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });

        const finalY = (data.cursor?.y ?? 150) + 20;
        doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text(
          `Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`,
          40,
          finalY
        );
      }
    }
  });

  doc.save('reporte_proveedores.pdf');
}

exportarExcel() {
  const fechaHora = new Date().toLocaleString();

  // ========= FECHAS (IGUAL AL PDF) =========
  const fechas: string[] = [];
  this.listaProveedor.forEach((xdat: any) => {
    if (xdat.fecha) fechas.push(xdat.fecha.toString());
  });

  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // ========= FILAS EXCEL =========
  const data: any[][] = [];

  // Encabezado (idéntico al PDF)
  data.push(['REPORTE DE PROVEEDORES']);
  data.push(['“Estos son los reportes de los pagos según el seguimiento realizado”']);
  data.push([`Informe correspondiente al período del: ${minFechaFormatted}   al: ${maxFechaFormatted}`]);
  data.push([]); // fila en blanco

  // Cabecera de tabla
  data.push([
    '#',
    'Encargado',
    'Razón Social',
    'Nit',
    'Teléfono',
    'Dirección',
    'Fecha Registro'
  ]);

  // Datos
  this.listaProveedor.forEach((xdat: any, index: number) => {
    data.push([
      index + 1,
      `${xdat.persona?.nombre || ''} ${xdat.persona?.ap_paterno || ''} ${xdat.persona?.ap_materno || ''}`.trim(),
      xdat.razon_social,
      xdat.nit || 'no registrado',
      xdat.telefono || 'Sin teléfono',
      `${xdat.ciudad?.nombre || ''} - ${xdat.direccion || ''}`,
      `${xdat.fecha?.split('-').reverse().join('/') || ''} ${xdat.hora || ''}`
    ]);
  });

  // Pie (idéntico al PDF, como filas finales)
  data.push([]);
  data.push([`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`]);

  // ========= CREAR EXCEL =========
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

  // Ajustar ancho de columnas
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 35 },
    { wch: 20 },
  ];

  const workbook: XLSX.WorkBook = {
    Sheets: { 'Proveedores': worksheet },
    SheetNames: ['Proveedores']
  };

  const excelBuffer: any = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  saveAs(blob, 'reporte_proveedores.xlsx');
}









  ngOnInit(): void {
    this.modelProveedor();
    this.modelCiudad();
    this.modelPersona();
  }
  filtro: string = ''; 
  buscarProveedor() {
    if (this.filtro.trim()) {
      this.proveService.buscarProveedor(this.filtro).subscribe((result) => {
        this.listaProveedor = result;
      });
    } else {
      this.modelProveedor(); // Si el filtro está vacío, recargar todas las personas
    }

  }
 
registrarProveedor() {
   this.loadingSave = true;
  const ciudadselect = this.proveForm.get('ciudad')?.value as Ciudad;
  const perselect = this.proveForm.get('persona')?.value as Persona;
      const fecha = new Date();
      const hora = fecha.toTimeString().split(' ')[0];
    this.xper = {
      telefono: this.proveForm.get('telefono')?.value,
      nit: this.proveForm.get('nit')?.value,
      razon_social: this.proveForm.get('razon_social')?.value,
      direccion: this.proveForm.get('direccion')?.value,
      ciudad: ciudadselect,
      persona: perselect,
      fecha: fecha,
      hora: hora,
      estado: 1,
    },

    this.proveService
      .RegistrarProveedor(this.xper)
      .subscribe(() => {
        this.loadingSave = false;
        this.guardarRegistro()
        this.modelProveedor();
        this.proveForm.reset();
      });
  }

// modificar proveedor
vistaProveedor(xdat: Proveedor) { 
  const Seleccionada = this.listaPersona.find(c => c.idpersona === xdat.persona?.idpersona) || null;
  const CiudaSeleccionado = this.listaCiudad.find(c => c.idciudad === xdat.ciudad?.idciudad) || null;
  this.proveForm.patchValue({
    idproveedor: xdat.idproveedor,
    razon_social: xdat.razon_social,
    fecha: xdat.fecha,
    hora: xdat.hora,
    nit: xdat.nit,
    direccion: xdat.direccion,
    telefono: xdat.telefono,
    estado: xdat.estado,
    ciudad: CiudaSeleccionado,
    persona: Seleccionada,
  })
}

modificarProveedor() {
   this.loadingSave = true;
  const ciudadselect = this.proveForm.get('ciudad')?.value as Ciudad;
  const perselect = this.proveForm.get('persona')?.value as Persona;
    this.xper = {
      idproveedor: this.proveForm.get('idproveedor')?.value,
      telefono: this.proveForm.get('telefono')?.value,
      nit: this.proveForm.get('nit')?.value,
      razon_social: this.proveForm.get('razon_social')?.value,
      direccion: this.proveForm.get('direccion')?.value,
      ciudad: ciudadselect,
      persona: perselect,
      fecha: this.proveForm.get('fecha')?.value,
      hora: this.proveForm.get('hora')?.value,
      estado: this.proveForm.get('estado')?.value,
    },

    this.proveService
      .ModificarProveedor(this.xper)
      .subscribe(() => {
        this.modelProveedor();
         this.loadingSave = false;
        this.guardarRegistroP()
        this.proveForm.reset();
      });
  }



loadingSave = false;




 perInfo = '';
  eliminarNegocio!: Proveedor;
  vistaEliminar(fall: Proveedor ){
    this.perInfo = fall.razon_social;
    this.eliminarNegocio = fall;
    
  }

  EliminarProveedor() {
  if (this.eliminarNegocio && this.eliminarNegocio.idproveedor) {
    this.proveService.eliminarProveedor(this.eliminarNegocio.idproveedor).subscribe({
      next: () => {
        this.proveService.ListarProveedor().subscribe((fall) => this.listaProveedor = fall);

        this.messageService.add({
          severity: 'success',
          summary: '¡Eliminación exitosa!',
          detail: `${this.perInfo} fue eliminado correctamente.`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error al eliminar proveedor:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error al eliminar',
          detail: 'No se puede eliminar este proveedor porque ya está siendo usado en una compra.',
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
              this.EliminarProveedor(); 
              
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
    this.proveForm.reset();
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
    this.proveForm.reset();
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


mostrarFiltros1: boolean = false;

generarReporte(): void {
  this.mostrarFiltros1 = !this.mostrarFiltros1;
}

  }

