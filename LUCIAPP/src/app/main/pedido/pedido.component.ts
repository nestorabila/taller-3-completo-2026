import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG Components
import { Dialog, DialogModule } from 'primeng/dialog';
import { SplitterModule } from 'primeng/splitter';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Otros
import { NgxPaginationModule } from 'ngx-pagination';
import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { Catalogo } from 'src/app/model/catalogo';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Negocio } from 'src/app/model/negocio';
import { Pedido } from 'src/app/model/pedido';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { DepedidoService } from 'src/app/servicio/pedido.service';
import { RouterModule } from '@angular/router';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { Credencial } from 'src/app/model/credencial';
import { Factura } from 'src/app/model/factura';
import { IonicModule } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss'],
     standalone: true,
  // imports: [CommonModule, RouterModule],
   imports: [IonicModule, RouterModule, NgxPaginationModule, SplitterModule, FieldsetModule,AvatarModule,ConfirmDialog , MenuModule, ToastModule, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
   providers: [ConfirmationService, MessageService],
})
export class PedidoComponent  {

 pag= 1;
    mostrarDetalle = false;
    toggleDetalle() {
      this.mostrarDetalle = !this.mostrarDetalle;
    }
  
  
    // ObtenerCategoria!: Categoria;
    
      listaCatalogo: Catalogo[]=[];
      listaNegocio: Negocio[]=[];
      listaPedido: Pedido[]=[];
      listaDetallePedido: DetallePedido[]=[];
    
        pedidoForm: any = new FormGroup({
            idpedido: new FormControl(''),
            fecha: new FormControl(''),
            fecha_entrega: new FormControl(''),
            hora:  new FormControl(''),
            libreria: new FormControl(''),
          })

           detpedidoForm: any = new FormGroup({
            iddetalle_pedido: new FormControl(''),
            cantidad: new FormControl(6, Validators.required),
            pedido:  new FormControl(''),
            estado: new FormControl(0),
            catalogo: new FormControl('', Validators.required),
          })
         
    
    constructor( private platform: Platform, private http: HttpClient,
      private actualizarService: ActualizarnombreService, private credencialService: CredencialService, private cataService: CatalogoService, private negocioService: NegocioService, private NegocioService: NegocioService, private PedidoService: DepedidoService, private detPedidoService: DetallePedidoService,   private proveService: CatalogoService, private confirmationService: ConfirmationService, private messageService: MessageService) {
   
    }
 catalogoYaUsado(): boolean {
  const personaSel = this.detpedidoForm.get('catalogo')?.value;
  if (!personaSel) return false;
  return this.listaDetallePedido.some(
    (p) => p.catalogo?.idcatalogo === personaSel.idcatalogo
  );
}
  fechaMayor(): boolean {
  const fechaRegistro = this.pedidoForm.get('fecha')?.value;
  const fechaEntrega = this.pedidoForm.get('fecha_entrega')?.value;

  if (!fechaRegistro || !fechaEntrega) return false;
  const fRegistro = new Date(fechaRegistro);
  const fEntrega = new Date(fechaEntrega);
  return fEntrega <= fRegistro;
}

    modelCliente() {
  this.negocioService.ListarNegocioCompleto().subscribe((fall) => {
    this.listaNegocio = fall.filter(p => p.persona?.estado== 1)
    .sort((a, b) => b.idlibreria - a.idlibreria);
  });
}

modelCatalogo() {
  
  this.cataService.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall.sort((a, b) => b.idcatalogo - a.idcatalogo);
  });
}
loading: boolean = false;

modelPedido() {
  this.loading = true;
  console.log("🚀iniciando pedidos");
console.log("📦 Raw LocalStorage:", localStorage.getItem('usuarioCompleto'));
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const id = usuario?.idpersona;

  console.log("🧑‍💻 ID del usuario logueado:", id);

  this.PedidoService.ListarPedido().subscribe((fall: any[]) => {

    console.log("📦 Lista completa de pedidos:", fall);

    fall.forEach((p, i) => {
      console.log(`🔍 Pedido ${i+1}:`, {
        idpedido: p.idpedido,
        libreria: p.libreria?.razon_social,
        personaID: p.libreria?.persona?.idpersona,
        estado: p.estado
      });
    });

    // 👉 FILTRO FINAL CORRECTO
    this.listaPedido = fall.filter(p =>
      Number(p.libreria?.persona?.idpersona) === Number(id) &&
      (p.estado === 1 || p.estado === 0 || p.estado === 3)
    );

    console.log("🎯 Pedidos filtrados:", this.listaPedido);

    if (this.listaPedido.length === 0) {
      console.warn("⚠ No hay pedidos asignados al usuario logueado.");
    }

    this.loading = false;
  });
}

doRefresh(event: any) {

  this.modelPedido();
  this.modelFactura();
  setTimeout(() => {
    event.target.complete();
  }, 1000);
}
listaFactura: Factura[] = [];

modelFactura() {
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const idPersona = usuario?.idpersona;

  this.PedidoService.ListarFactura().subscribe((fall: Factura[]) => {
    console.log("Lista completa de facturas:", fall);

    // Filtramos solo las facturas cuyo pedido pertenece al cliente que inició sesión
    this.listaFactura = (fall || []).filter(f =>
      f.pedido?.libreria?.persona?.idpersona === idPersona
    );

    console.log("Facturas filtradas por cliente:", this.listaFactura);
  });
}

        ObtenerPedido!: Pedido;
     modelDetallePedidoID() {
    if (this.ObtenerPedido) {
      this.detPedidoService.ListarDetallePedidoID(this.ObtenerPedido.idpedido!).subscribe((fall) => {
        this.listaDetallePedido= fall;
        console.log("detalle Pedidos obteniendo:: ", this.ObtenerPedido.hora, fall);
        
        
      });
    } else {
      console.warn('No hay para cargar');
    }
     }
  detalleVisibleId: number | null = null;
  totalesPorPedido: { [key: number]: number } = {};
  
verDetallePedido(idPedido: number) {
  if (this.detalleVisibleId === idPedido) {
    this.detalleVisibleId = null;
    this.listaDetallePedido = [];
  } else {
    this.detalleVisibleId = idPedido;
    this.ObtenerPedido = this.listaPedido.find(p => p.idpedido === idPedido)!;
    this.detPedidoService.ListarDetallePedidoID(idPedido).subscribe((resp) => {
      console.log('Detalles recibidos del backend para idPedido', idPedido, resp);
      this.listaDetallePedido = resp;

      const total = resp.reduce((acc, item) => acc + (item.precio_subtotal || 0), 0); // CORREGIDO
      this.totalesPorPedido[idPedido] = total;

    }, error => {
      console.error('Error al obtener detalles de Pedido:', error);
    });
  }
}

  getTotal(idPedido: number | undefined): number | null {
    if (idPedido === undefined) return null;
    return this.totalesPorPedido[idPedido] ?? null;
  }
      mostrarLogin: boolean = false;
  ngOnInit(): void {
      const token = localStorage.getItem('token');

  if (!token) {
    this.mostrarLogin = true;
    return;
  }
      this.modelCatalogo();
      this.modelPedido();
      this.modelFactura();
      this.modelCatalogo();
      this.modelCliente();
      this.modelDetallePedidoID();
      }
// Descargar Boleta de Venta


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
doc.text(`Fecha Registro: ${cliente?.fecha} ${cliente?.hora}`, 15, yPosition);


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

  const totalX = pageWidth - 60;
  const valueX = pageWidth - 20;

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




    // añadir mas Pedidos
     xper!: any;
    // añadir mas detales Pedidos
    xper1!: any;
    registrarDetallePedido() {
  const Seleccionado = this.detpedidoForm.get('catalogo')?.value as Catalogo;
  const cantidadSeleccionada = this.detpedidoForm.get('cantidad')?.value;
  this.xper1 = {
    cantidad: cantidadSeleccionada,
    precio_subtotal: cantidadSeleccionada * Seleccionado.precio,
    catalogo: Seleccionado,
    estado:0,
    pedido: this.PedidoSeleccionada,
  };
       console.log("enviadno datos al back end",this.xper1);
       
        this.detPedidoService
          .RegistrarDetallePedido(this.xper1)
          .subscribe(() => {
            this.guardarRegistro();
            
            
          });
      }
    

    // modificar detetallePedido
  vistaDetPedido(xdat: DetallePedido) { 
    const Seleccionada1 = this.listaCatalogo.find(c => c.idcatalogo === xdat.catalogo?.idcatalogo) || null; 
    this.detpedidoForm.patchValue({
      iddetalle_pedido: xdat.iddetalle_pedido,
      precio_subtotal: xdat.precio_subtotal,
      cantidad: xdat.cantidad,
      catalogo: Seleccionada1,
      pedido: xdat.pedido,
      estado: xdat.estado,
    
    })
  }
ModificarDetallePedido() {
  const cataSeleccionado = this.detpedidoForm.get('catalogo')?.value as Catalogo;
  const cantidadSeleccionada = this.detpedidoForm.get('cantidad')?.value;

  this.xper1 = {
    iddetalle_pedido: this.detpedidoForm.get('iddetalle_pedido')?.value,
    cantidad: cantidadSeleccionada,
    precio_subtotal: cantidadSeleccionada * cataSeleccionado.precio,
    catalogo: cataSeleccionado,
    estado: this.detpedidoForm.get('estado')?.value,
    pedido: this.ObtenerPedido,
  };

  console.log("enviando datos al back end para modificar", this.xper1);

  this.detPedidoService.ModificarDetallePedido(this.xper1).subscribe(() => {
    const idPedido = this.ObtenerPedido?.idpedido!;
    this.detPedidoService.ListarDetallePedidoID(idPedido).subscribe((resp) => {
      this.listaDetallePedido = resp;
      const total = resp.reduce((acc, item) => acc + (item.precio_subtotal || 0), 0);
      this.totalesPorPedido[idPedido] = total;
    });

    this.detpedidoForm.reset();
    this.guardarDPedido();
  });
}


  modalCancelarVisible: boolean = false;
perInfo3 = '';
modificarEstado!: Pedido;

vistaEstado(fall: Pedido) {
  this.perInfo3 = fall.libreria?.razon_social!;
  this.modificarEstado = fall;
  if (this.modificarEstado.estado === 1) {
    this.modalCancelarVisible = true;
  }
}

confirmarCancelarPedido() {
  if (this.modificarEstado.estado === 1) {
    this.PedidoService.cambiarEstadoPedido(this.modificarEstado).subscribe(() => {
      this.modelPedido();  // Actualiza tu lista u otro dato
      this.mostrarMensaje('warn', 'Pedido cancelado', `El pedido de ${this.perInfo3} fue cancelado correctamente.`);
      this.modalCancelarVisible = false;
    });
  }
}

cancelarCancelarPedido() {
  this.modalCancelarVisible = false;
  this.mostrarMensaje1('info', 'Cancelación anulada', `No se canceló el pedido.`);
}

mostrarMensaje1(tipo: string, titulo: string, mensaje: string) {
  console.log(`[${tipo.toUpperCase()}] ${titulo} - ${mensaje}`);
  // O reemplaza con un toast personalizado
}



  visible: boolean = false;
   visibleF: boolean = false;
  visibleC: boolean = false;
  visibleDC: boolean = false;
  PedidoSeleccionada!: Pedido;
  
  showDialogF() {
      this.visibleF = true; 
      this.modelFactura(); 
}
 salir() {
    this.visibleF = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cerrado',
      detail: 'OK.',
      life: 3000
    });
        
  } 
 showDialog(pedido: Pedido) {
  this.PedidoSeleccionada = pedido; 
  this.detPedidoService.ListarDetallePedidoID(pedido.idpedido!).subscribe(
    (resp) => {
      this.listaDetallePedido = resp; 
      this.visible = true;  
    },
    (error) => {
      this.listaDetallePedido = [];   
      this.visible = true;  
    }
  );
}

  
      guardarRegistro() {    
    this.visible = false;
    this.detPedidoService.ListarDetallePedidoID(this.ObtenerPedido.idpedido!).subscribe((fall) => (this.listaDetallePedido = fall))
    this.detpedidoForm.reset();
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
  
    showDialogC(Pedido: Pedido) {
    this.PedidoSeleccionada = Pedido;
    this.visibleC = true;  // Abre el diálogo
  }
  
  guardarPedido() {
    this.visibleC = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizando',
      detail: 'El registro fue actualizado exitosamente.',
      life: 3000
    });
  }
  
  cancelarPedido() {
    this.visibleDC = false;
    this.detpedidoForm.reset();
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  } 
  
  showDialogDC(Pedido: DetallePedido) {
    
    this.visibleDC = true;  // Abre el diálogo
  }
  
  guardarDPedido() {
    this.visibleDC = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizando',
      detail: 'El registro fue actualizado exitosamente.',
      life: 3000
    });
  }
  
  cancelarDPedido() {
    this.visibleDC = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  } 
  incrementarCantidad() {
  const actual = this.detpedidoForm.get('cantidad')?.value || 0;
  const nuevoValor = actual + 6;
  this.detpedidoForm.get('cantidad')?.setValue(nuevoValor);
}

disminuirCantidad() {
  const actual = this.detpedidoForm.get('cantidad')?.value || 0;
  const nuevoValor = actual - 6;
  if (nuevoValor >= 6) {
    this.detpedidoForm.get('cantidad')?.setValue(nuevoValor);
  }
}

    
modalEliminarVisible: boolean = false;
perInfo = '';
eliminardetPedido!: DetallePedido;

vistaEliminar(fall: DetallePedido) {
  this.perInfo = fall.catalogo?.nombre!;
  this.eliminardetPedido = fall;
  this.modalEliminarVisible = true;
}

confirmarEliminar() {
  if (this.eliminardetPedido?.iddetalle_pedido) {
    this.detPedidoService.eliminarDetPedido(this.eliminardetPedido.iddetalle_pedido).subscribe({
      next: () => {
        const idPedido = this.ObtenerPedido?.idpedido!;
    this.detPedidoService.ListarDetallePedidoID(idPedido).subscribe((resp) => {
      this.listaDetallePedido = resp;
      const total = resp.reduce((acc, item) => acc + (item.precio_subtotal || 0), 0);
      this.totalesPorPedido[idPedido] = total;
  
        });
        this.mostrarMensaje('success', '¡Eliminación exitosa!', `${this.perInfo} fue eliminado correctamente.`);
        this.modalEliminarVisible = false;
      }
    });
  }
}

cancelarEliminar() {
  this.modalEliminarVisible = false;
  this.mostrarMensaje('warn', 'Operación cancelada', `No se eliminó ${this.perInfo}.`);
}

mostrarMensaje(tipo: string, titulo: string, mensaje: string) {
  // Aquí puedes usar cualquier lógica para mostrar mensajes, ej: un toast personalizado o console.log
  console.log(`[${tipo.toUpperCase()}] ${titulo} - ${mensaje}`);
}

  
   @ViewChildren('menuDetalle') menus!: QueryList<ElementRef>;
  
    // Detecta cualquier clic fuera de los <details>
    @HostListener('document:click', ['$event'])
    cerrarMenusFuera(event: Event) {
      this.menus?.forEach((ref) => {
        if (ref.nativeElement.hasAttribute('open') && !ref.nativeElement.contains(event.target)) {
          ref.nativeElement.removeAttribute('open');
        }
      });
    }
  





    
        // login
        credencial: Credencial = {
            usuario: '',
            contrasena: ''
          };
          mensaje: string = '';
          exito: boolean | null = null; 
     
          mostrarMensaje2(msg: string, exito: boolean) {
  this.mensaje = msg;
  this.exito = exito;

  // Oculta el mensaje después de 3 segundos
  setTimeout(() => {
    this.mensaje = '';
    this.exito = null;
  }, 3000); // 3000 ms = 3 segundos
}
cargando: boolean = false;  
   iniciarSesion() {
    if (!this.credencial.usuario || !this.credencial.contrasena) {
     this.mostrarMensaje2('Ingrese su usuario y contraseña', false);
      this.exito = false;
      return;
    }
    this.cargando = true;
    this.credencialService.iniciarSesion(this.credencial.usuario, this.credencial.contrasena)
      .subscribe({
        next: (res) => {
          console.log('ROL del usuario:', res.rol?.idrol);
  
          if (res.estado === 0) {
            this.exito = false;
            this.mostrarMensaje2('Sus credenciales han sido bloqueadas. No puede acceder.', false);
            return;
          }
  
          if (res.rol === 'Cliente') {
            this.exito = true;
            localStorage.setItem('token', res.token);
            localStorage.setItem('idpersona', res.idpersona);
            localStorage.setItem('usuarioCompleto', JSON.stringify(res));
            this.actualizarService.notificarCambio();
               this.mostrarLogin = false;
  
            // Puedes también llamar aquí a los modelos si es necesario:
            this.modelCatalogo();
      this.modelPedido();
      
      this.modelCatalogo();
      this.modelCliente();
      this.modelDetallePedidoID();
  
          } else {
            this.exito = false;
            this.mostrarMensaje2('Lo siento no tienes permisos.', false);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.exito = false;
          this.mostrarMensaje2('Usuario o contraseña Incorrecto', false);
          console.error('Error en login:', err); 
        }
      });
  }
}
