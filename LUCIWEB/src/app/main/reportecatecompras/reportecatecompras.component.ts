import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ciudad } from 'src/app/model/ciudad';
import { Negocio } from 'src/app/model/negocio';
import { CuidadService } from 'src/app/servicio/ciudad.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FieldsetModule } from 'primeng/fieldset';
import { SplitterModule } from 'primeng/splitter';
import { RolService } from 'src/app/servicio/rol.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Pedido } from 'src/app/model/pedido';
import { DetalleInsumoService } from 'src/app/servicio/detalle-insumo.service';
import { InsumoService } from 'src/app/servicio/insumo.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NgChartsModule } from 'ng2-charts';
import { Insumo } from 'src/app/model/insumo';
import { DetalleInsumo } from 'src/app/model/detalle-insumo';
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}

@Component({
  selector: 'app-reportecatecompras',
   standalone: true,
    imports: [NgChartsModule,CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
     providers: [ConfirmationService, MessageService],
  templateUrl: './reportecatecompras.component.html',
  styleUrl: './reportecatecompras.component.css'
})
export class ReportecatecomprasComponent {
modoDetalle: boolean = false;

idcompraFiltro!: number;
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

listaCompra: Insumo[] = [];
todosDetalles: { [idcompra: number]: DetalleInsumo[] } = {};

constructor(
  private compraService: InsumoService,
  private detcompraService: DetalleInsumoService,
  private httpClient: HttpClient,
  private formBuilder: FormBuilder
) {}
public lineChartType: 'line' = 'line';
  public lineChartData: {
    labels: string[];
    datasets: ChartDataset<'line', number[]>[];
  } = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    }
  };
graficarCompras(periodo: 'dia' | 'mes' = 'mes') {
    this.compraService.GraficarCompras(periodo).subscribe(data => {
      const etiquetas: string[] = [];
      const valores: number[] = [];

      data.forEach(item => {
        const fecha = new Date(item.periodo);
const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
etiquetas.push(fecha.toLocaleDateString('es-BO', opciones));

        valores.push(parseFloat(item.precio_total));
      });

      this.lineChartData = {
        labels: etiquetas,
        datasets: [
          {
            data: valores,
            label: 'Gasto Total Bs',
            tension: 0.4,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            fill: true,
          }
        ]
      };
    });
  }
  totalSemana: number = 0;
totalMes: number = 0;
totalGeneral: number = 0;

calcularTotales() {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1); // 1ro del mes

  this.totalSemana = 0;
  this.totalMes = 0;
  this.totalGeneral = 0;

  for (let compra of this.listaCompra) {
    const fechaCompra = new Date(compra.fecha);

   const total = compra.precio_total ?? 0;

    this.totalGeneral += total;

    if (fechaCompra >= inicioMes) {
      this.totalMes += total;
    }

    if (fechaCompra >= inicioSemana) {
      this.totalSemana += total;
    }
  }

  // Redondear a 2 decimales
  this.totalSemana = +this.totalSemana.toFixed(2);
  this.totalMes = +this.totalMes.toFixed(2);
  this.totalGeneral = +this.totalGeneral.toFixed(2);
}

ngOnInit(): void {
  this.modelCompra();
  this.graficarCompras('dia');
  this.calcularTotales();
}

proveedoresAgrupados: any[] = [];

modelCompra() {
  const params: any = {};

  if (this.idcompraFiltro) {
    params.nombre = this.idcompraFiltro;
  }

  if (this.fechaDesdeFiltro) {
    params.fechaDesde = this.fechaDesdeFiltro;
  }

  if (this.fechaHastaFiltro) {
    params.fechaHasta = this.fechaHastaFiltro;
  }

  this.compraService.ListarReporteCompra(params).subscribe((fall) => {
    this.listaCompra = fall.sort((a, b) => b.idcompra! - a.idcompra!);
    this.agruparPorProveedor();
    this.calcularTotales();
  });

  if (this.modoDetalle) {
    this.listarDetalleTodos();
  } else {
    this.todosDetalles = {};
  }
}

agruparPorProveedor() {
  const agrupado: { [key: string]: any[] } = {};

  for (let compra of this.listaCompra) {
    const nombre = compra.proveedor?.razon_social || 'Sin proveedor';
    if (!agrupado[nombre]) {
      agrupado[nombre] = [];
    }
    agrupado[nombre].push(compra);
  }

  // Convertimos a arreglo para recorrerlo en la plantilla
  this.proveedoresAgrupados = Object.entries(agrupado).map(([nombre, compras]) => ({
    proveedor: nombre,
    compras: compras
  }));
}


// Obtener todos los detalles agrupados por idpedido
listarDetalleTodos() {
  this.detcompraService.ListarDetalleCompra().subscribe((datos) => {
    this.todosDetalles = {};

    for (let d of datos) {
      if (!this.todosDetalles[d.idcompra!]) {
        this.todosDetalles[d.idcompra!] = [];
      }
      this.todosDetalles[d.idcompra!].push(d);
    }
  });
}
exportarPDF() {
// aqui hacer metodo completo , encabezado, el cuerpo que es la tabla y el pie
console.log("ingreso al metodo al hacer clik");

  const doc = new jsPDF();
  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const filas: any[] = [];
  let contador = 1;

  // calcular totales y rango de fechas
  const fechas: string[] = [];
  const precioTotal = this.listaCompra.reduce((acc, c) => acc + (c.precio_total || 0), 0).toFixed(2);

  // Construir filas: agrupar por proveedor (ya tiene this.proveedoresAgrupados)
  this.proveedoresAgrupados.forEach((grupo: any) => {
    const proveedorNombre = grupo.proveedor || 'Sin proveedor';

    // fila de proveedor (colSpan)
    filas.push({
      nro: { content: `PROVEEDOR: ${proveedorNombre.toUpperCase()}`, colSpan: 5, styles: { halign: 'left', fillColor: [220, 220, 220], fontStyle: 'bold' } }
    });

    const compras: any[] = grupo.compras || [];
    compras.forEach((comp: any) => {
      // registro principal de compra
      filas.push({
        nro: contador++,
        cod: `COD-${comp.idcompra}`,
        cantidad: comp.cantidad_total != null ? `${comp.cantidad_total} Uds.` : '',
        precio: comp.precio_total != null ? `${comp.precio_total} Bs.` : '',
        // combinar fecha + hora en la última columna
        hora: `${comp.fecha ? (new Date(comp.fecha)).toLocaleDateString() : ''} ${comp.hora || ''}`.trim()
      });

      if (this.modoDetalle) {
        const detalles: DetalleInsumo[] | undefined = this.todosDetalles[comp.idcompra!];
        if (detalles && detalles.length) {
          // fila de subtítulo para detalles
          filas.push({
            nro: { content: `Detalles de COD-${comp.idcompra}`, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold' } }
          });

          // filas de detalle (mismo ancho de tabla, adaptando columnas)
          detalles.forEach((d: any, idx: number) => {
            filas.push({
              nro: '',
              cod: d.producto?.nombre || '',
              cantidad: d.cantidad_u != null ? `${d.cantidad_u}` : '',
              precio: d.precio_u != null ? `${d.precio_u} Bs.` : '',
              hora: d.precio_t != null ? `${d.precio_t} Bs.` : ''
            });
          });
        }
      }

      if (comp.fecha) fechas.push(comp.fecha.toString());
    });
  });

  // calcular rango fechas
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return fechaStr;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // columnas para la tabla principal (5 columnas)
  const columnas = [
    { header: 'Nro', dataKey: 'nro' },
    { header: 'Cod/Producto', dataKey: 'cod' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Fecha / Hora', dataKey: 'hora' }
  ];

  // si no hay datos
  if (filas.length === 0) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('REPORTE DE COMPRAS POR CATEGORÍA', pageWidth / 2, 24, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text('No hay datos para mostrar en el reporte.', pageWidth / 2, 56, { align: 'center' });
    doc.save(`Reporte_compras_${fechaTexto.replace(/\//g, '-')}.pdf`);
    return;
  }

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 50,
    styles: { fontSize: 8 },
    theme: 'grid',
    didDrawPage: (data) => {
      // encabezado compacto (igual formato que persona/producto)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text('REPORTE DE COMPRAS', pageWidth / 2, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Informe correspondiente al período del: ${minFechaFormatted || '---'}   al: ${maxFechaFormatted || '---'}`, 20, 32);
  // Mostrar el total gastado a la derecha, justo al nivel del subtítulo
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(`Precio total Gastado Bs: ${precioTotal}`, pageWidth - 20, 32, { align: 'right' });

      // línea decorativa colocada arriba
      doc.setDrawColor(0); doc.setLineWidth(1.0);
        doc.line(23, 40, pageWidth - 23, 40);


      // pie de página
      const footerY = pageHeight - 30;
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      
      if (data.pageNumber === (doc as any).getNumberOfPages()) {
        const finalY = (data.cursor?.y ?? 100) + 8;
        doc.setFontSize(8);
        doc.setTextColor(70);
        doc.text(`Generado por: LUCIWEB, Fecha: ${fechaHora}   ${'Precio total de compras: ' + precioTotal + ' Bs.'}`, 40, finalY);
      }
    }
  });
  // Guardar/descargar el PDF generado
  doc.save(`Reporte_compras_${fechaTexto.replace(/\//g, '-')}.pdf`);

}

exportarEXCEL() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString().replace(/\//g, '-');

  // Totales / Fechas
  const fechas: string[] = [];
  const precioTotal = this.listaCompra.reduce((acc, c) => acc + (c.precio_total || 0), 0).toFixed(2);

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return fechaStr;
  };

  // Contador para numeración
  let contador = 1;

  // Recorrer proveedores agrupados
  this.proveedoresAgrupados.forEach((grupo: any) => {
    const proveedorNombre = grupo.proveedor || 'Sin proveedor';

    // Fila de proveedor (fusionada luego)
    ws_data.push([`PROVEEDOR: ${proveedorNombre.toUpperCase()}`]);

    // Encabezados de la tabla
    const headers = ['Nro', 'Cod/Producto', 'Cantidad', 'Precio', 'Fecha / Hora'];
    ws_data.push(headers);

    const compras: any[] = grupo.compras || [];
    compras.forEach((comp: any) => {
      // Fila principal de compra
      ws_data.push([
        contador++,
        `COD-${comp.idcompra}`,
        comp.cantidad_total != null ? `${comp.cantidad_total} Uds.` : '',
        comp.precio_total != null ? `${comp.precio_total} Bs.` : '',
        `${comp.fecha ? (new Date(comp.fecha)).toLocaleDateString() : ''} ${comp.hora || ''}`.trim()
      ]);

      // Guardar fecha
      if (comp.fecha) fechas.push(comp.fecha.toString());

      // Detalles de compra
      if (this.modoDetalle) {
        const detalles: DetalleInsumo[] | undefined = this.todosDetalles[comp.idcompra!];
        if (detalles && detalles.length) {
          ws_data.push([`Detalles de COD-${comp.idcompra}`]);
          ws_data.push(['', 'Producto', 'Cantidad', 'Precio U.', 'Precio Total']);

          detalles.forEach((d: any) => {
            ws_data.push([
              '',
              d.producto?.nombre || '',
              d.cantidad_u != null ? `${d.cantidad_u}` : '',
              d.precio_u != null ? `${d.precio_u} Bs.` : '',
              d.precio_t != null ? `${d.precio_t} Bs.` : ''
            ]);
          });
        }
      }
    });

    // Línea vacía entre proveedores
    ws_data.push(['']);
  });

  // Rango de fechas
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Título y subtítulo al inicio
  const titulo = 'REPORTE DE COMPRAS';
  ws_data.unshift(
    [`${titulo}`],
    [''], // espacio
    [`Informe correspondiente al período del: ${minFechaFormatted || '---'}  al: ${maxFechaFormatted || '---'}`],
    [''] // salto
  );

  // Crear hoja
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

  // Merges
  if (!ws['!merges']) ws['!merges'] = [];
  const maxCols = 5;
  const merges = ws['!merges'] as XLSX.Range[];

  // Merge título y subtítulo
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } }); // título
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: maxCols - 1 } }); // subtítulo

  // Merge filas de proveedor y detalles
  ws_data.forEach((row, rIdx) => {
    const cell = row[0];
    if (typeof cell === 'string' && (cell.startsWith('PROVEEDOR:') || cell.startsWith('Detalles de '))) {
      merges.push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: maxCols - 1 } });
    }
  });

  ws['!merges'] = merges;

  // Ajuste de ancho de columnas
  ws['!cols'] = Array(maxCols).fill({ wch: 18 });

  // Pie de página
  ws_data.push(['']);
  ws_data.push([`Generado por: LUCIWEB, Fecha: ${fechaHora}    Precio total de compras: ${precioTotal} Bs.`]);
  const lastIdx = ws_data.length - 1;
  ws['!merges'].push({ s: { r: lastIdx, c: 0 }, e: { r: lastIdx, c: maxCols - 1 } });

  // Agregar hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Compras');

  // Generar Excel y descargar
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_compras_${fechaTexto}.xlsx`);
}

  mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}


mostrarFiltros1: boolean = false;

generarReporte(): void {
  this.mostrarFiltros1 = !this.mostrarFiltros1;
}

mostrarFiltros2: boolean = false;

gastos(): void {
  this.mostrarFiltros2 = !this.mostrarFiltros2;
}
}
