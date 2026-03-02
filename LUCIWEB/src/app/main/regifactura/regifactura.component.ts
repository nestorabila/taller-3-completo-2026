
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
import { Pago } from 'src/app/model/pago';

import { PedidoService } from 'src/app/servicio/pedido.service';
import { VentaService } from 'src/app/servicio/venta.service';
import { Pedido } from 'src/app/model/pedido';
import { MetodoPago } from 'src/app/model/metodo-pago';
@Component({
  selector: 'app-regifactura',
      imports: [DropdownModule, ProgressSpinnerModule, NgxPaginationModule,Dialog, SplitterModule, FieldsetModule,AvatarModule, MessageModule, MessagesModule, ConfirmDialog, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
              providers: [ConfirmationService, MessageService],
  templateUrl: './regifactura.component.html',
  styleUrl: './regifactura.component.css'
})
export class RegifacturaComponent {
pag=1;
listaPago: Pago[]=[];
pagoForm: FormGroup = new FormGroup({
  idpago: new FormControl(''),
  pedido: new FormControl('', Validators.required),
  metodo_pago: new FormControl('', Validators.required),
  monto: new FormControl('', [
    Validators.required,
    Validators.min(1),
    Validators.max(9999),
    Validators.pattern('^[0-9]*$') // solo números enteros
  ]),
  nota: new FormControl('', [
    Validators.minLength(5),
    Validators.maxLength(200)
  ]),
  fecha: new FormControl(''),
  hora: new FormControl(''),
  persona: new FormControl(''),
});


constructor(private pedidoService: PedidoService, private ventaService: VentaService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

  
loading: boolean = false;
modelPago() {
  this.loading = true;
  this.pedidoService.ListarPago().subscribe((fall) => {
    this.listaPago = fall.sort((a, b) => b.idpago - a.idpago);
    this.loading = false;
    
  });
}
listaPedido: Pedido[]=[];
modelPedido() {
  this.pedidoService.ListarPedido().subscribe((fall) => {
    this.listaPedido =fall.filter(p => p.estado === 1 || p.estado === 2 || p.estado === 3);
  });
}

listaMetodoPago: MetodoPago[]=[];
modelMetodoPago() {
  this.ventaService.ListarMetodoPago().subscribe((fall) => {
    this.listaMetodoPago = fall;

    // ⭐ SI SOLO HAY UN MÉTODO, SE SELECCIONA AUTOMÁTICAMENTE
    if (this.listaMetodoPago.length === 1) {
      this.pagoForm.get('metodo_pago')?.setValue(this.listaMetodoPago[0]);
    }
  });
}

onPedidoChange(event: any) {
  const pedido: Pedido = event.value; 
  if (pedido) {
    // Calcula el total pagado anteriormente solo considerando pagos activos (estado === 1)
    const pagosPrevios = this.listaPago
      .filter(p => p.pedido?.idpedido === pedido.idpedido && p.estado === 1)
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    // Calcula el monto restante
    const montoRestante = (pedido.precio_total || 0) - pagosPrevios;

    // Auto-completa el input monto con lo que falta
    this.pagoForm.get('monto')?.setValue(montoRestante);

    // Actualiza el validador máximo dinámicamente al restante
    this.pagoForm.get('monto')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(montoRestante),
      Validators.pattern('^[0-9]*$')
    ]);
    this.pagoForm.get('monto')?.updateValueAndValidity();
  } else {
    // Si no hay pedido seleccionado, limpia el monto y restablece validadores
    this.pagoForm.get('monto')?.setValue('');
    this.pagoForm.get('monto')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(9999),
      Validators.pattern('^[0-9]*$')
    ]);
    this.pagoForm.get('monto')?.updateValueAndValidity();
  }
}



ngOnInit(): void {
   this.modelPago();
    this.modelPedido();
    this.modelMetodoPago();
}
descargarComprobante(pago: Pago) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Margen estético
  const marginLeft = 20;
  let cursorY = 18;

  // === TÍTULO ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text('COMPROBANTE DE PAGO', pageWidth / 2, cursorY, { align: 'center' });

  // Línea separadora elegante
  cursorY += 6;
  doc.setDrawColor(180);
  doc.line(marginLeft, cursorY, pageWidth - marginLeft, cursorY);
  cursorY += 10;

  const libreria = pago.pedido?.libreria;
  const cliente = libreria?.persona;

  // === INFORMACIÓN PRINCIPAL (Bloque) ===
  doc.setFontSize(11);
  doc.setTextColor(90);

  const info = [
    ["Librería:", libreria?.razon_social || "-"],
    ["Cliente:", `${cliente?.nombre || "-"} ${cliente?.ap_paterno || ""}`],
    ["Registrado por:", `${pago.persona?.nombre || "-"} ${pago.persona?.ap_paterno || ""}`],
    ["Fecha del Pago:", `${pago.fecha ? new Date(pago.fecha).toLocaleDateString() : "-"}  ${pago.hora || "-"}`],
  ];

  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginLeft, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(value, marginLeft + 45, cursorY);
    cursorY += 7;
  });

  cursorY += 6;
  doc.setDrawColor(200);
  doc.line(marginLeft, cursorY, pageWidth - marginLeft, cursorY); // línea separadora
  cursorY += 8;

  // === TABLA DETALLES ===
  const tableData = [
    ['Monto Pagado', `${pago.monto} Bs`],
    ['Pago', pago.metodo_pago?.nombre || '-'],
    ['Nota', pago.nota || '-'],
    ['Estado', pago.estado === 1 ? 'Activo' : 'Anulado']
  ];

  autoTable(doc, {
    startY: cursorY,
    head: [['Detalle', 'Información']],
    body: tableData,
    theme: 'grid',
    columnStyles: { 1: { halign: 'right' } },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: 40,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 11,
      cellPadding: 4,
      lineWidth: 0.2
    }
  });

  // Determinar donde terminó la tabla
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // === FOOTER ===
  const fechaGeneracion = new Date();
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Comprobante generado por Sistema Luciweb — Norma Maizares\n${fechaGeneracion.toLocaleDateString()} ${fechaGeneracion.toLocaleTimeString()}`,
    pageWidth / 2,
    finalY,
    { align: 'center' }
  );

  // Descargar
  doc.save(`Comprobante_${pago.idpago}.pdf`);
}




filtro: string = ''; 
    buscar() {
      if (this.filtro.trim()) {
        this.pedidoService.buscarPago(this.filtro).subscribe((fall) => {
          this.listaPago = fall.sort((a, b) => b.idpago - a.idpago);
        });
      } else {
        this.modelPago(); 
      }
  
    }
   xper!: any
   loadingSave = false;

  registrarPago() {
     this.loadingSave = true;
        const fecha = new Date();
        const hora = fecha.toTimeString().split(' ')[0];
        const idpersona = Number(localStorage.getItem('idpersona'));
        const tiposeleccionado = this.pagoForm.get('pedido')?.value as Pedido;
         const metodoseleccionado = this.pagoForm.get('metodo_pago')?.value as MetodoPago;
      this.xper = {
        monto: this.pagoForm.get('monto')?.value,
        nota: this.pagoForm.get('nota')?.value,
        fecha: fecha,
        hora: hora,
        pedido: tiposeleccionado,
        idpersona,
        metodo_pago: metodoseleccionado,
        estado:1,

      },
      this.pedidoService
        .RegistrarPago(this.xper)
        .subscribe(() => {
          this.modelPago();
           this.loadingSave = false;
           this.guardarRegistro();
          this.pagoForm.reset();
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

// cambiar estado pago;
 // eliminar negocio
  perInfo = '';
  eliminarNegocio!: Pago;
  vistaEliminar(fall: Pago){
    this.perInfo = fall.pedido?.libreria?.razon_social+"";
    this.eliminarNegocio = fall;
    
  }
    confirm2(event: Event) {
  this.confirmationService.confirm({
    target: event.target as EventTarget,
    message: `¿Deseas confirmar la anulacion de pago de: ${this.perInfo}?`,
    header: 'Confirmar Anulacion',
    icon: 'pi pi-check-circle',

    rejectLabel: 'Cancelar',
    rejectButtonProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true,
    },

    acceptButtonProps: {
      label: 'Confirmar',
      severity: 'success',
    },

    accept: () => {
      this.EliminarPago(); 
    },

    reject: () => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Operación cancelada',
        detail: `No se realizó la verificación de ${this.perInfo}.`,
        life: 3000
      });
    }
  });
}


EliminarPago() {
  if (this.eliminarNegocio && this.eliminarNegocio.idpago) {

    console.log('Librería seleccionada:', this.eliminarNegocio);
    console.log('Estado actual antes de cambiar:', this.eliminarNegocio.estado);

    // 🔁 Cambiar estado en vez de eliminar
    this.eliminarNegocio.estado = this.eliminarNegocio.estado === 0 ? 1 : 0;

    console.log('Estado después de cambiar:', this.eliminarNegocio.estado);

    this.pedidoService.cambiarEstadoPago(this.eliminarNegocio).subscribe({
      next: (res) => {
        console.log('Respuesta del backend:', res);

        this.modelPago(); // refresca la lista
        this.messageService.add({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: `${this.perInfo} fue actualizado correctamente.`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado.',
          life: 4000
        });
      }
    });
  } else {
    console.warn('No hay librería seleccionada o no tiene idlibreria');
  }
}




  }