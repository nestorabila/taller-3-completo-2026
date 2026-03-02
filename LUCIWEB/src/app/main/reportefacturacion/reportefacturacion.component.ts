import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Factura } from 'src/app/model/factura';
import { Pedido } from 'src/app/model/pedido';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { FacturaService } from 'src/app/servicio/factura.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { VentaService } from 'src/app/servicio/venta.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sistema } from 'src/app/model/sistema';
import { SistemaService } from 'src/app/servicio/sistema.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportefacturacion',
  imports: [  ReactiveFormsModule, FormsModule,   CommonModule],
       providers: [ConfirmationService, MessageService],
  templateUrl: './reportefacturacion.component.html',
  styleUrl: './reportefacturacion.component.css'
})
export class ReportefacturacionComponent {

          listaFactura: Factura[]=[];
          listaPedido: Pedido[]=[];
          listaDetallePedido: DetallePedido[]=[];
        
        
        constructor(private serSistema: SistemaService, private http: HttpClient,
          private pedidoService: PedidoService, private ventaService: VentaService, private facturaSerivice: FacturaService, private cataService: CatalogoService,  private detPedidoService: DetallePedidoService,   private proveService: CatalogoService, private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService) {
       
        }
   
// Nueva estructura: método de pago → estado → facturas
listaFacturaAgrupada: { 
  metodoPago: string, 
  estados: { estado: string, facturas: Factura[] }[] 
}[] = [];

agruparFacturasPorMetodoYEstado() {
  const grupos: { [mp: string]: { [estado: string]: Factura[] } } = {};

  this.listaFactura.forEach(f => {
    const mp = f.metodo_pago?.nombre ?? 'Sin Método';
    const estado = f.estado === 1 ? 'Activo' : 'Anulada';

    if (!grupos[mp]) grupos[mp] = {};
    if (!grupos[mp][estado]) grupos[mp][estado] = [];

    grupos[mp][estado].push(f);
  });

  this.listaFacturaAgrupada = Object.keys(grupos).map(mpKey => ({
    metodoPago: mpKey,
    estados: Object.keys(grupos[mpKey]).map(estKey => ({
      estado: estKey,
      facturas: grupos[mpKey][estKey]
    }))
  }));
}
personasPorRolEstado: {
  [rol: string]: {
    [estado: string]: Factura[];
  };
} = {};
// En tu modelFactura
modelFactura() {
  const params = {
    rol: this.rolFiltro || '',
    nombre: this.nombreFiltro || '',
    estado: this.estadoFiltro || '',
    fechaDesde: this.fechaDesdeFiltro || '',
    fechaHasta: this.fechaHastaFiltro || ''
  };
 
    this.facturaSerivice.ListarReporteFactura(params).subscribe((fall) => {

    this.listaFactura = fall;
    this.agruparFacturasPorMetodoYEstado();

this.personasPorRolEstado = this.listaFactura.reduce(
  (acc: Record<string, Record<string, Factura[]>>, persona: Factura) => {
    const nombreRol = persona.metodo_pago?.nombre || 'Sin Rol';
    const estadoStr = persona.estado === 1 ? 'Activo' : 'Anulado';

    if (!acc[nombreRol]) {
      acc[nombreRol] = {};
    }
    if (!acc[nombreRol][estadoStr]) {
      acc[nombreRol][estadoStr] = [];
    }
    acc[nombreRol][estadoStr].push(persona);
    return acc;
  },
  {}
);

  });
}

   modelPedido() {
    this.pedidoService.ListarPedido().subscribe((fall) => {
      console.log("lista factura:",fall);
      this.listaPedido = fall
    });
  }
calcularTotalPrecio(lista: any[]): number {
  let total = 0;
  lista.forEach(grupo => {
    grupo.estados.forEach((sub: { facturas: any[]; }) => {
      sub.facturas.forEach(f => total += f.precio_total || 0);
    });
  });
  return total;
}
contarTotalVentas(lista: any[]): number {
  let total = 0;
  lista.forEach(grupo => {
    grupo.estados.forEach((subgrupo: { facturas: string | any[]; }) => {
      total += subgrupo.facturas.length;
    });
  });
  return total;
}
   

listaNegocio: Sistema[]=[];
modelNegocio() {
  this.serSistema.ListarSistema().subscribe((fall) => {
    console.log("lista del negocio osea empresa siempre es unaica lista: ",fall)
    this.listaNegocio = fall
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
     
          ngOnInit(): void {
          this.modelPedido()
          this.modelDetallePedidoID();
          this.modelFactura();
          this.modelNegocio();
          }

exportarPDF() {
  const doc = new jsPDF('p', 'pt', 'a4');
  const fechaHora = new Date().toLocaleString();

  // Columnas: Cliente + Razón social en una sola columna, Precio alineado derecha
  const columnas = [
    { header: 'Nro', dataKey: 'nro' },
    { header: 'Cliente', dataKey: 'cliente' }, // combina cliente y razón social
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Hora', dataKey: 'hora' },
    { header: 'Registrado', dataKey: 'registrado' },
    { header: 'Precio Bs.', dataKey: 'precio', styles: { halign: 'right' } }
  ];

  const filas: any[] = [];
  let contador = 1;
  let totalGanancia = 0;
  const fechas: string[] = [];

  this.listaFacturaAgrupada.forEach(grupo => {
    grupo.estados.forEach(subgrupo => {
      // Mostrar estado si no es activo
      if (+subgrupo.estado !== 1) {
        filas.push({
          nro: { content: `Estado: ${subgrupo.estado}`, colSpan: 6, styles: { halign: 'left', fillColor: [240,240,240] } }
        });
      }

      subgrupo.facturas.forEach(factura => {
        filas.push({
          nro: contador++,
          cliente: `${factura.pedido?.libreria?.razon_social || ''} - ${factura.pedido?.libreria?.persona?.nombre || ''} ${factura.pedido?.libreria?.persona?.ap_paterno || ''} ${factura.pedido?.libreria?.persona?.ap_materno || ''}`,
           fecha: factura.fecha
      ? `${new Date(factura.fecha).getDate().toString().padStart(2, '0')}/${(new Date(factura.fecha).getMonth() + 1).toString().padStart(2, '0')}/${new Date(factura.fecha).getFullYear()}`
      : '',
          hora: factura.hora,
          registrado: factura.persona?.nombre + ' ' + factura.persona?.ap_paterno,
          precio: { content: factura.precio_total!.toFixed(2), styles: { halign: 'right' } }
        });

        totalGanancia += Number(factura.precio_total) || 0;
        if (factura.fecha) fechas.push(factura.fecha.toString());
      });
    });
  });

  const minFecha = fechas.length ? fechas.reduce((a,b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a,b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y,m,d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);
  const totalVentas = this.contarTotalVentas(this.listaFacturaAgrupada);

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 150,
    styles: { fontSize: 8 },
    theme: 'grid',
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Encabezado
      doc.setFont('helvetica','bold'); doc.setFontSize(16);
      doc.text('REPORTE DE VENTAS', pageWidth/2,40,{align:'center'});

      doc.setFont('helvetica','italic'); doc.setFontSize(11);
      doc.text('“Estos son los reportes de las ventas según el seguimiento realizado”', pageWidth/2,60,{align:'center'});

      doc.setFont('helvetica','normal'); doc.setFontSize(10);
      doc.text(`Informe correspondiente al período del: ${minFechaFormatted}   al: ${maxFechaFormatted}`, 40,85);

      // Totales al inicio
      doc.setFont('helvetica','bold');
      doc.text(`Total Ventas: ${totalVentas}`, 40,105);
      doc.text(`Total Ganancia: Bs. ${totalGanancia.toFixed(2)}`, pageWidth-40,105,{align:'right'});

      // Línea decorativa
      doc.setDrawColor(0); doc.setLineWidth(1.2);
      doc.line(40,115,pageWidth-40,115);

      // Pie de página
      const footerY = pageHeight-30;
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      doc.line(40,footerY-10,pageWidth-40,footerY-10);

      doc.setFont('helvetica','italic'); doc.setFontSize(9);
      doc.text(`Página ${data.pageNumber}`, pageWidth-40,pageHeight-20,{align:'right'});

      // Frase de cierre solo última página
      if (data.pageNumber === doc.getNumberOfPages()) {
        const finalY = (data.cursor?.y ?? 150) + 20;
        doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`, 40, finalY);
      }
    }
  });

  // Guardar PDF
  doc.save('reporte_seguimiento_ventas.pdf');
}


exportarExcel() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString().replace(/\//g, '-');

  // Columnas: Cliente + Razón Social en una sola columna
  const columnas = ['Nro', 'Cliente', 'Fecha', 'Hora', 'Registrado', 'Precio Bs.'];

  let contador = 1;
  let totalGanancia = 0;
  const fechas: string[] = [];

  // Encabezados de tabla
  ws_data.push(columnas);

  this.listaFacturaAgrupada.forEach(grupo => {
    grupo.estados.forEach(subgrupo => {
      // Mostrar estado si no es activo
      if (+subgrupo.estado !== 1) {
        ws_data.push([`Estado: ${subgrupo.estado}`]);
      }

      subgrupo.facturas.forEach(factura => {
        ws_data.push([
          contador++,
          `${factura.pedido?.libreria?.razon_social || ''} - ${factura.pedido?.libreria?.persona?.nombre || ''} ${factura.pedido?.libreria?.persona?.ap_paterno || ''} ${factura.pedido?.libreria?.persona?.ap_materno || ''}`.trim(),
          factura.fecha
      ? `${new Date(factura.fecha).getDate().toString().padStart(2, '0')}/${(new Date(factura.fecha).getMonth() + 1).toString().padStart(2, '0')}/${new Date(factura.fecha).getFullYear()}`
      : '',
          factura.hora,
          factura.persona?.nombre + ' ' + factura.persona?.ap_paterno,
          Number(factura.precio_total).toFixed(2) // precio alineado a derecha
        ]);

        totalGanancia += Number(factura.precio_total) || 0;
        if (factura.fecha) fechas.push(factura.fecha.toString());
      });
    });

    // Línea vacía entre grupos
    ws_data.push(['']);
  });

  // Rango de fechas
  const minFecha = fechas.length ? fechas.reduce((a,b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a,b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y,m,d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Título y subtítulo al inicio
  ws_data.unshift(
    ['REPORTE DE VENTAS'],
    [''],
    [`Informe correspondiente al período del: ${minFechaFormatted || '---'}   al: ${maxFechaFormatted || '---'}`],
    ['']
  );

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

  // Merge título, subtítulo y estados
  if (!ws['!merges']) ws['!merges'] = [];
  const maxCols = columnas.length;
  const merges = ws['!merges'] as XLSX.Range[];

  // Merge título y subtítulo
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } });
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: maxCols - 1 } });

  // Merge estados
  ws_data.forEach((row, rIdx) => {
    const cell = row[0];
    if (typeof cell === 'string' && cell.startsWith('Estado:')) {
      merges.push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: maxCols - 1 } });
    }
  });

  ws['!merges'] = merges;

  // Ajuste ancho columnas
  ws['!cols'] = Array(maxCols).fill({ wch: 18 });

  // Totales al final
  ws_data.push(['']); // línea vacía
  ws_data.push([
    `Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}    Total Ganancia: Bs. ${totalGanancia.toFixed(2)}`
  ]);
  const lastIdx = ws_data.length - 1;
  ws['!merges'].push({ s: { r: lastIdx, c: 0 }, e: { r: lastIdx, c: maxCols - 1 } });

  // Añadir hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Ventas');

  // Generar y descargar Excel
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_ventas_${fechaTexto}.xlsx`);
}



rolFiltro: string = '';
nombreFiltro: string = '';
estadoFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';



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




















 mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}


mostrarFiltros1: boolean = false;

generarReporte(): void {
  this.mostrarFiltros1 = !this.mostrarFiltros1;
}







}
