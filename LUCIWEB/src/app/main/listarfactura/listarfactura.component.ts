import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Categoria } from 'src/app/model/categoria';

import { CategoriaService } from 'src/app/servicio/categoria.service';

import { SplitButton } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { NgxPaginationModule } from 'ngx-pagination';
import { Catalogo } from 'src/app/model/catalogo';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Negocio } from 'src/app/model/negocio';
import { Pedido } from 'src/app/model/pedido';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { VentaService } from 'src/app/servicio/venta.service';
import { FacturaService } from 'src/app/servicio/factura.service';
import { Factura } from 'src/app/model/factura';
import { MetodoPago } from 'src/app/model/metodo-pago';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HttpClient } from '@angular/common/http';
import { Sistema } from 'src/app/model/sistema';
import { SistemaService } from 'src/app/servicio/sistema.service';
import { DropdownModule } from 'primeng/dropdown';
import { Pago } from 'src/app/model/pago';

interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-listarfactura',
  imports: [DropdownModule, ProgressSpinnerModule, Dialog, NgxPaginationModule, SplitterModule, InputSwitchModule, FieldsetModule,AvatarModule,ConfirmDialog , MenuModule, ToastModule, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
     providers: [ConfirmationService, MessageService],
  templateUrl: './listarfactura.component.html',
  styleUrl: './listarfactura.component.css'
})
export class ListarfacturaComponent {

  
    pag= 1;
      mostrarDetalle = false;
      toggleDetalle() {
        this.mostrarDetalle = !this.mostrarDetalle;
      }
        listaFactura: Factura[]=[];
        listaMetodoPago: MetodoPago[]=[];
        
        listaPedido: Pedido[]=[];
        listaDetallePedido: DetallePedido[]=[];
      
          facturaForm: any = new FormGroup({
              idventa: new FormControl(''),
              fecha: new FormControl(''),
              hora: new FormControl(''),
              pedido:  new FormControl('', Validators.required),
            })
            pagoIncompleto: boolean = false;
            pagoIncompletoMensaje: string = 'Pago incompleto para generar la venta';
      constructor(private serSistema: SistemaService, private ventaService: VentaService, private facturaSerivice: FacturaService, private cataService: CatalogoService, private negocioService: NegocioService, private NegocioService: NegocioService, private PedidoService: PedidoService, private detPedidoService: DetallePedidoService,   private proveService: CatalogoService, private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService, private http: HttpClient) {
     
      }
 

  
  loading: boolean = false;
     modelPedido() {
  this.loading = true;
  this.PedidoService.ListarPedido().subscribe((fall) => {
  console.log("lista pedidos: ",fall)
    this.listaPedido = fall
      .filter(a => a.estado === 3)
      .sort((a, b) => b.idpedido! - a.idpedido!); 
    this.loading = false;
  });
}
listaPago: Pago[]=[];
modelPago() {
  this.PedidoService.ListarPago().subscribe((fall) => {
   
    this.listaPago = fall.sort((a, b) => b.idpago - a.idpago);
    
  });
}

  verificarPago(event: any) {
    // event.value es el pedido seleccionado
    const pedido: Pedido = event && event.value ? event.value : null;
    this.pagoIncompleto = false;
    if (!pedido) {
      // limpiar errores
      const control = this.facturaForm.get('pedido');
      if (control) control.setErrors(null);
      return;
    }

    // sumar solo pagos con estado === 1 para este pedido
    const pagosDelPedido = this.listaPago.filter(p => (p.pedido?.idpedido === pedido.idpedido) && p.estado === 1);
    const sumaPagos = pagosDelPedido.reduce((s, p) => s + (Number(p.monto) || 0), 0);

    // obtener precio total del pedido (puede ser string)
    const precioTotal = pedido && (pedido as any).precio_total != null ? Number((pedido as any).precio_total) : undefined;

    if (precioTotal == null || isNaN(precioTotal)) {
      // si no hay precio total, no podemos validar — considerarlo OK
      const control = this.facturaForm.get('pedido');
      if (control) control.setErrors(null);
      this.pagoIncompleto = false;
      return;
    }

    if (sumaPagos >= precioTotal) {
      // ok
      const control = this.facturaForm.get('pedido');
      if (control) control.setErrors(null);
      this.pagoIncompleto = false;
    } else {
      // incompleto — establecer error para impedir submit
      const control = this.facturaForm.get('pedido');
      if (control) control.setErrors({ pagoIncompleto: true });
      this.pagoIncompleto = true;
    }
  }
modelMeotodoPago() {
  this.ventaService.ListarMetodoPago().subscribe((fall) => {
    this.listaMetodoPago = fall
  });
}
    

modelVenta() {
  this.facturaSerivice.ListarFactura().subscribe((fall) => {
   
    this.listaFactura = fall
  });
}

listaNegocio: Sistema[]=[];
modelNegocio() {
  this.serSistema.ListarSistema().subscribe((fall) => {
   
    this.listaNegocio = fall
  });
}

ObtenerPedido!: Pedido;
       modelDetallePedidoID() {
      if (this.ObtenerPedido) {
        this.detPedidoService.ListarDetallePedidoID(this.ObtenerPedido.idpedido!).subscribe((fall) => {
          this.listaDetallePedido= fall;
          
          
          
        });
      } else {
        console.warn('No hay para cargar');
      }
       }
   
  
  
        ngOnInit(): void {
          const token = localStorage.getItem('token');
        this.modelPedido();
        this.modelDetallePedidoID();
        this.modelVenta();
        this.modelPago();
        this.modelNegocio();
        this.modelMeotodoPago();
        
        }
// Diceñar boleta de venta

descargarVenta(factura: any) {
  console.log("Factura seleccionada: ", factura);
  
  this.http.get('/assets/cambiado.jpg', { responseType: 'blob' }).subscribe(
    (blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.generarBoletaPDF(reader.result as string, factura);
      };
      reader.readAsDataURL(blob);
    },
    () => this.generarBoletaPDF(null, factura)
  );
}

private generarBoletaPDF(logoBase64: string | null, factura: any) {
  const doc = new jsPDF('p', 'mm', 'A4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;
 const cliente = factura.pedido?.libreria?.persona;
  const libreria = factura.pedido?.libreria;
  const ciudad = factura.pedido?.libreria?.ciudad;
  //aqui puede auemnat detalle pedido apra que trabes mas rapido
  // ============ LOGO (IZQUIERDA ARRIBA) ============
  const logoW = 20; // mm
  const logoH = 10;
  const titleX = pageWidth / 2;
  const logoX = 15; // colocar logo a la izquierda encima del nombre
  const logoY = 8;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn('Error al insertar logo en PDF');
    }
  }

  // Empresa (alineada a la izquierda debajo del logo)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const empresaY = logoY + logoH + 4;
  doc.text('CREACIONES LUCIANITA', 15, empresaY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const negocio = this.listaNegocio[0]; // siempre es único
doc.text(`Dirección: ${negocio.direccion}, Tarija`, 15, empresaY + 4);
doc.text(`Teléfono: ${negocio.telefono}`, 15, empresaY + 8);
  doc.text('Correo: norma@gmail.com', 15, empresaY + 12);

  // ============ TÍTULO CENTRAL ============
  // colocar el título más arriba, centrado (espacio libre en el centro)
  const titleY = logoY + 10; // elevar el título hacia arriba
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BOLETA DE VENTA', titleX, titleY, { align: 'center' });

  // ============ NRO DE VENTA (DERECHA) ============
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Nro de Venta:', pageWidth - 50, 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`00${factura.idventa}`, pageWidth - 25, 15);

  // ============ LÍNEA SEPARADORA ===========
  // =
  // mover el contenido (datos de cliente, librería y tabla) más abajo para evitar solapamientos
  yPosition = Math.max(empresaY + 18, titleY + 14);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============ DATOS DEL CLIENTE ============
  yPosition += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 15, yPosition);

  yPosition += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Datos de cliente
  // Datos de cliente con valores reales
doc.text(`Código Cliente: ${cliente?.idpersona}`, 15, yPosition);
doc.text(`Nombre: ${cliente?.nombre}`, pageWidth / 2 + 5, yPosition);

yPosition += 4;
doc.text(`Cédula: ${cliente?.cedula}`, 15, yPosition);
doc.text(`Apellidos: ${cliente?.ap_paterno} ${cliente?.ap_materno}`, pageWidth / 2 + 5, yPosition);

yPosition += 4;
doc.text(`Teléfono: ${cliente?.telefono}`, 15, yPosition);
doc.text(`Correo: ${cliente?.correo}`, pageWidth / 2 + 5, yPosition);

yPosition += 4;
doc.text(`Fecha Registro: ${cliente?.fecha?.split('-').reverse().join('/')} ${cliente?.hora}`, 15, yPosition);


  // ============ DATOS DE LIBRERÍA ============
  yPosition += 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LIBRERÍA', 15, yPosition);

  yPosition += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Datos de librería con valores reales
doc.text(`Código Librería: ${libreria?.idlibreria}`, 15, yPosition);
doc.text(`Dirección: ${libreria?.direccion}, ${ciudad?.nombre}`, pageWidth / 2 + 5, yPosition);

yPosition += 4;
doc.text(`Razón Social: ${libreria?.razon_social}`, 15, yPosition);


  // ============ LÍNEA SEPARADORA ============
  yPosition += 6;
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============ TABLA DE DETALLES ============
  // ============ TABLA DE DETALLES ============
yPosition += 5;

// columnas fijas
const columns = ['#', 'Nombre', 'Cantidad U.', 'Precio U.', 'Sub Total'];

// filas usando los datos reales del detalle del pedido
const rows = factura.pedido?.detalle_pedidos?.map((detalle: DetallePedido, index: number) => [
  `${index + 1}`, // Número de fila
  detalle.catalogo?.nombre || 'Sin nombre', // Nombre del producto
  `${detalle.cantidad}`, // Cantidad
  detalle.catalogo ? detalle.catalogo.precio.toFixed(2) : '0.00', // Precio unitario
  detalle.precio_subtotal.toFixed(2) // Subtotal
]) || [];

// generar la tabla
autoTable(doc, {
  startY: yPosition,
  head: [columns],
  body: rows,
  theme: 'grid',
  headStyles: {
    fillColor: [100, 150, 200],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 9,
    halign: 'center'
  },
  bodyStyles: {
    fontSize: 8,
    textColor: [0, 0, 0]
  },
  columnStyles: {
    0: { halign: 'center', cellWidth: 12 },
    1: { halign: 'left', cellWidth: 100 },
    2: { halign: 'center', cellWidth: 25 },
    3: { halign: 'right', cellWidth: 22 },
    4: { halign: 'right', cellWidth: 22 }
  },
  margin: { left: 15, right: 15 },
  didDrawPage: (data: any) => {
    doc.setDrawColor(100, 150, 200);
    doc.line(15, yPosition - 2, pageWidth - 15, yPosition - 2);
  }
});
const total = factura.pedido?.detalle_pedidos?.reduce(
  (sum: number, detalle: DetallePedido) => sum + detalle.precio_subtotal,
  0
) || 0;

  // ============ TOTALES (DERECHA) ============
  const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 60;
  yPosition = finalY + 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const totalX = pageWidth - 40;
  const valueX = pageWidth - 15;

  doc.text('Total Bs:', totalX, yPosition);
  doc.text(total.toFixed(2), valueX, yPosition, { align: 'right' });

  // ============ LÍNEA SEPARADORA FINAL ============
  yPosition += 6;
  doc.setDrawColor(100, 150, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============ FRASE FINAL ============
yPosition += 8;
doc.setFontSize(9);
doc.setFont('helvetica', 'italic');
doc.text('¡Gracias por su preferencia!', pageWidth / 2, yPosition, { align: 'center' });

// Nueva frase con fecha y hora
yPosition += 5;
doc.setFontSize(8); // un poquito más pequeño que la anterior
doc.setFont('helvetica', 'italic');

const fechaHora = new Date();
const fechaHoraStr = `${fechaHora.toLocaleDateString()} ${fechaHora.toLocaleTimeString()}`;
doc.text(`Generado por sistema LUCIWEB, Norma Maizares, ${fechaHoraStr}`, pageWidth / 2, yPosition, { align: 'center' });


  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Transacción realizada exitosamente', pageWidth / 2, yPosition, { align: 'center' });

  // ============ GUARDAR PDF ============
  doc.save('Boleta_Venta.pdf');
}


xper!:any;
registrarFactura() {
   this.loadingSave = true;
  const idpersona = Number(localStorage.getItem('idpersona'));
  const pedidoSeleccionado = this.facturaForm.get('pedido')?.value as Pedido;
  const metodoPagoSeleccionado = this.facturaForm.get('metodo_pago')?.value as MetodoPago;
      const fecha = new Date();
      const hora = fecha.toTimeString().split(' ')[0];
      
    this.xper = {
      pedido: pedidoSeleccionado,
      idmetodo: 1, 
      idpersona,
      fecha: fecha,
      hora: hora,
      estado: 1,
    },

    this.facturaSerivice.RegistrarFactura(this.xper)
      .subscribe(() => {
        this.modelVenta();
        this.modelPedido();
        this. guardarRegistro();
         this.loadingSave = false
        this.facturaForm.reset();
      });
  }


  
loadingSave = false;

filtro: string = ''; 
  buscarVenta() {
    if (this.filtro.trim()) {
      this.facturaSerivice.buscarFactura(this.filtro).subscribe((result) => {
        this.listaFactura = result;
      });
    } else {
      this.modelVenta(); // Si el filtro está vacío, recargar todas las personas
    }

  }
   perInfo = '';
    eliminarNegocio!: Factura;
    vistaEliminar(fall: Factura ){
      this.perInfo = fall.pedido?.libreria?.persona?.nombre!;
      this.eliminarNegocio = fall;
      
    }
  
    AnularFactura() {
    if (this.eliminarNegocio && this.eliminarNegocio.idventa) {
      this.facturaSerivice.AnularFactura(this.eliminarNegocio.idventa).subscribe({
        next: () => {
         this.modelVenta();
          this.messageService.add({
            severity: 'success',
            summary: '¡Anulacion exitosa!',
            detail: `${this.perInfo} Venta anulada correctamente.`,
            life: 3000
          });
        },
       
      });
    }
  }
  
  confirm2(event: Event) {
          this.confirmationService.confirm({
              target: event.target as EventTarget,
             message: `¿Estás seguro de anular la venta de: ${this.perInfo}?`,
              header: 'Confirmar Anulacion',
              icon: 'pi pi-info-circle',
              rejectLabel: 'Cancel',
              rejectButtonProps: {
                  label: 'Cancelar',
                  severity: 'secondary',
                  outlined: true,
              },
              acceptButtonProps: {
                  label: 'Anular',
                  severity: 'danger',
              },
  
              accept: () => {
                this.AnularFactura(); 
                
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

    
 mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}
  
}
