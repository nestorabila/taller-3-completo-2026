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
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Pedido } from 'src/app/model/pedido';
import { DetalleInsumoService } from 'src/app/servicio/detalle-insumo.service';
import { InsumoService } from 'src/app/servicio/insumo.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NgChartsModule } from 'ng2-charts';



@Component({
  selector: 'app-reportecatepedidos',
  standalone: true,
    imports: [NgChartsModule,CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
     providers: [ConfirmationService, MessageService],
  templateUrl: './reportecatepedidos.component.html',
  styleUrl: './reportecatepedidos.component.css'
})
export class ReportecatepedidosComponent {
  get totalPedidos(): number {
  return this.listaPedido.length;
}

get totalPendientes(): number {
  return this.listaPedido.filter(p => p.estado === 1).length;
}

get totalEnProceso(): number {
  return this.listaPedido.filter(p => p.estado === 2).length;
}

// Efectividad: porcentaje de pedidos completados o entregados sobre el total
get efectividad(): number {
  if (this.listaPedido.length === 0) return 0;
  const completados = this.listaPedido.filter(p => p.estado === 3 || p.estado === 4).length;
  return Math.round((completados / this.listaPedido.length) * 100);
}

listaPedidosProximos: Pedido[] = [];
chartData: any;
chartOptions: any;
cargarPedidosProximos() {
  this.pedidoService.ObtenerPedidosProximos().subscribe(res => {
    this.listaPedidosProximos = res;

    this.generarGrafico(); // luego definimos esta función
  });
}
generarGrafico() {
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColors: string[] = [];

  const hoy = new Date();

  this.listaPedidosProximos.forEach(pedido => {
    const fechaEntrega = new Date(pedido.fecha_entrega!);
    const diasFaltantes = Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    let color = '';
    if (diasFaltantes <= 0) {
      color = 'rgba(255, 0, 0, 0.8)';
    } else if (diasFaltantes <= 1) {
      color = 'rgba(255, 69, 0, 0.8)';
    } else if (diasFaltantes <= 3) {
      color = 'rgba(255, 165, 0, 0.8)';
    } else {
      color = 'rgba(0, 128, 0, 0.8)';
    }

    const nombre = pedido.libreria?.razon_social || pedido.persona?.nombre || 'Desconocido';

    labels.push(nombre); // 🔥 Solo nombre o razón social, sin días
    data.push(5 - Math.min(diasFaltantes, 5));
    backgroundColors.push(color);
  });

  this.chartData = {
    labels,
    datasets: [{
      label: 'Urgencia de Entrega',
      data,
      backgroundColor: backgroundColors
    }]
  };

  this.chartOptions = {
    responsive: true,
    indexAxis: 'x',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context:any) => {
            const urgenciaMap: Record<number, string> = {
              0: 'Muy Lejos',
              1: 'Baja',
              2: 'Media',
              3: 'Alta',
              4: 'Crítica',
              5: 'Vencido'
            };
            const urgencia = urgenciaMap[context.parsed.y] || context.parsed.y;

            const pedidoIndex = context.dataIndex;
            const pedido = this.listaPedidosProximos[pedidoIndex];
            const fechaEntrega = new Date(pedido.fecha_entrega!);
            const hoy = new Date();
            const diasFaltantes = Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

            return `Urgencia: ${urgencia} | Tiempo restante: ${diasFaltantes} día${Math.abs(diasFaltantes) === 1 ? '' : 's'}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: 'Urgencia' },
        ticks: {
          stepSize: 1,
          callback: (value: number) => {
            switch(value) {
              case 0: return 'Muy Lejos';
              case 1: return 'Baja';
              case 2: return 'Media';
              case 3: return 'Alta';
              case 4: return 'Crítica';
              case 5: return 'Vencido';
              default: return value;
            }
          }
        }
      }
    }
  };
}
getAvancePedido(idpedido: number): number {
  const detalles = this.todosDetalles[idpedido];

  if (!detalles || detalles.length === 0) return 0;

  const completados = detalles.filter(d => d.estado === 1).length;
  const total = detalles.length;

  const porcentaje = (completados / total) * 100;

  return Math.round(porcentaje); // Redondeamos para mostrar número limpio
}


modoDetalle: boolean = false;

nombreFiltro: string = '';
estadoFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

listaPedido: Pedido[] = [];
todosDetalles: { [idpedido: number]: DetallePedido[] } = {};

ListaAgrupada: { [estado: string]: Pedido[] } = {};

constructor(
  private pedidoService: PedidoService,
  private detpedidoService: DetallePedidoService,
  private httpClient: HttpClient,
  private formBuilder: FormBuilder
) {}

ngOnInit(): void {
  this.modelPedido();
  this.cargarPedidosProximos();
}

// Agrupar por estado y cargar detalles si se requiere
modelPedido() {
  const params: any = {};

  if (this.nombreFiltro) {
    params.nombre = this.nombreFiltro;
  }

  if (this.estadoFiltro) {
    params.estado = this.estadoFiltro;
  }

  if (this.fechaDesdeFiltro) {
    params.fechaDesde = this.fechaDesdeFiltro;
  }

  if (this.fechaHastaFiltro) {
    params.fechaHasta = this.fechaHastaFiltro;
  }

  this.pedidoService.ListarReportePedido(params).subscribe((fall) => {
    this.listaPedido = fall.sort((a, b) => b.idpedido! - a.idpedido!);

    this.ListaAgrupada = this.listaPedido.reduce((grupos: any, pedido: Pedido) => {
      let estadoTexto = '';

      switch (pedido.estado) {
        case 0: estadoTexto = 'Cancelado'; break;
        case 1: estadoTexto = 'Pendiente'; break;
        case 2: estadoTexto = 'En proceso'; break;
        case 3: estadoTexto = 'Completado'; break;
        case 4: estadoTexto = 'Entregado'; break;
        default: estadoTexto = 'Desconocido';
      }

      if (!grupos[estadoTexto]) {
        grupos[estadoTexto] = [];
      }

      grupos[estadoTexto].push(pedido);
      return grupos;
    }, {});

    // Si está activado el modo detalle, cargar detalles
    if (this.modoDetalle) {
      this.listarDetalleTodos();
    } else {
      this.todosDetalles = {};
    }
  });
}

// Obtener todos los detalles agrupados por idpedido
listarDetalleTodos() {
  this.detpedidoService.ListarDetallePedido().subscribe((datos) => {
    this.todosDetalles = {};

    for (let d of datos) {
      if (!this.todosDetalles[d.idpedido!]) {
        this.todosDetalles[d.idpedido!] = [];
      }
      this.todosDetalles[d.idpedido!].push(d);
    }
  });
}
getDiasRestantes(fechaEntrega: string | Date | null): number {
  if (!fechaEntrega) return 0;

  const hoy = new Date();

  // Asegurarse que sea Date (en caso sea string)
  const entrega = new Date(fechaEntrega);

  if (isNaN(entrega.getTime())) return 0; // si la fecha no es válida

  const diffMs = entrega.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDias > 0 ? diffDias : 0;
}

exportarExcel() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  const fechaActual = new Date();
  const fechaTexto = fechaActual.toLocaleDateString().replace(/\//g, '-');
  const fechaHora = fechaActual.toLocaleString();

  const columnas = ['#', 'Datos del Cliente (libreria)', 'Cantidad Total', 'Precio Total', 'Fecha,hora registro', 'Fecha Entrega', 'T-R', 'Avance'];

  let contadorGlobal = 1;
  const fechas: string[] = [];

  const safeFormatFecha = (input: any): string => {
    if (!input) return 'Sin fecha';
    if (input instanceof Date && !isNaN(input.getTime())) return input.toLocaleDateString();
    if (typeof input === 'number' && !isNaN(input)) return new Date(input).toLocaleDateString();
    const s = String(input).trim();
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    const ddmmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyMatch) return `${ddmmyMatch[1]}/${ddmmyMatch[2]}/${ddmmyMatch[3]}`;
    return s;
  };

  // Calcular rango de fechas
  Object.keys(this.ListaAgrupada).forEach((estado) => {
    this.ListaAgrupada[estado].forEach((pedido: any) => {
      if (pedido && pedido.fecha) fechas.push(safeFormatFecha(pedido.fecha));
    });
  });

  const minFecha = fechas.length ? fechas.reduce((a,b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a,b) => a > b ? a : b) : '';

  // Encabezado
  const titulo = 'REPORTE DE PEDIDOS';
  ws_data.push([titulo]);
  ws_data.push(['']);
  ws_data.push([`Informe correspondiente al período del: ${minFecha || '---'} al: ${maxFecha || '---'}`]);
  ws_data.push(['']);

  const maxCols = columnas.length;

  Object.keys(this.ListaAgrupada).forEach((estado) => {
    ws_data.push([`PEDIDO: ${estado.toUpperCase()}`]);
    ws_data.push(columnas);

    this.ListaAgrupada[estado].forEach((pedido: any, idx: number) => {
      ws_data.push([
        idx + 1,
        `${pedido.negocio?.persona?.nombre || ''} ${pedido.negocio?.persona?.ap_paterno || ''} ${pedido.negocio?.persona?.ap_materno || ''} - (${pedido.negocio?.razon_social || ''})`.trim(),
        (pedido.cantidad_total! / 12) + ' docenas',
        pedido.precio_total + ' Bs',
        (pedido.fecha ? safeFormatFecha(pedido.fecha) : 'Sin fecha') + ' - ' + pedido.persona_registrado,
        pedido.fecha_entrega ? safeFormatFecha(pedido.fecha_entrega) : 'Sin fecha',
        pedido.fecha_entrega ? this.getDiasRestantes(pedido.fecha_entrega) + ' días' : 'Sin fecha',
        this.modoDetalle && this.todosDetalles[pedido.idpedido!] ? this.getAvancePedido(pedido.idpedido!) + ' %' : '---'
      ]);

      if (this.modoDetalle && this.todosDetalles[pedido.idpedido!] && this.todosDetalles[pedido.idpedido!].length > 0) {
        ws_data.push([`Detalles del pedido`]);
        ws_data.push(['#', 'Nombre', 'Descripcion', 'Cantidad(U)', 'Precio(U)', 'Subtotal', 'Estado']);

        this.todosDetalles[pedido.idpedido!].forEach((det, i) => {
          ws_data.push([
            i + 1,
            det.catalogo?.nombre || '',
            det.catalogo?.descripcion || '',
            det.cantidad,
            det.catalogo?.precio + ' Bs',
            det.precio_subtotal + ' Bs',
            det.estado === 1 ? 'completado' : 'pendiente'
          ]);
        });
        ws_data.push(['']); // fila vacía después de detalles
      }
    });

    ws_data.push(['']); // fila vacía entre estados
  });

  // Pie de página
  ws_data.push(['']);
  ws_data.push([`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`]);

  // Crear hoja y merges
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
  if (!ws['!merges']) ws['!merges'] = [];
  const merges = ws['!merges'] as XLSX.Range[];

  // Merge título y subtítulo
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } });
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: maxCols - 1 } });

  // Merge filas de estado y detalles
  ws_data.forEach((row, rIdx) => {
    const cell = row[0];
    if (typeof cell === 'string' && (cell.startsWith('PEDIDO:') || cell.startsWith('Detalles del pedido') || cell.startsWith('Generado por:'))) {
      merges.push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: maxCols - 1 } });
    }
  });

  ws['!merges'] = merges;

  // Ajustar ancho de columnas
  ws['!cols'] = Array(maxCols).fill({ wch: 25 });

  // Añadir hoja
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Pedidos');

  // Descargar Excel
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `ReportePedidos_${fechaTexto}.xlsx`);
}

exportarPDF() {
  const doc = new jsPDF('landscape', 'pt', 'A4');

  const fechaActual = new Date();
  const fecha = fechaActual.toLocaleDateString();
  const hora = fechaActual.toLocaleTimeString();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---------- Helpers para fechas ----------
  // Extrae YYYY-MM-DD de distintos formatos sin forzar UTC
  const toLocalYYYYMMDD = (input: any): string | null => {
    if (!input) return null;
    const s = String(input).trim();

    // YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    // DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
    const ddmmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyMatch) return `${ddmmyMatch[3]}-${ddmmyMatch[2]}-${ddmmyMatch[1]}`;

    // Fallback: if looks like timestamp number
    if (!isNaN(Number(s))) {
      const d = new Date(Number(s));
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }

    // Last resort: try Date parse and use local components (may vary)
    const dFallback = new Date(s);
    if (!isNaN(dFallback.getTime())) {
      const y = dFallback.getFullYear();
      const m = String(dFallback.getMonth() + 1).padStart(2, '0');
      const day = String(dFallback.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    return null;
  };

  // Devuelve DD/MM/YYYY desde distintos tipos (Date, number, string)
  const safeFormatFecha = (input: any): string => {
    if (!input) return 'Sin fecha';

    // Si ya es Date
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input.toLocaleDateString();
    }

    // Si es número (timestamp ms)
    if (typeof input === 'number' && !isNaN(input)) {
      const d = new Date(input);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }

    const s = String(input).trim();

    // Si string ISO o YYYY-MM-DD...
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

    // Si string DD/MM/YYYY
    const ddmmyMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (ddmmyMatch) return `${ddmmyMatch[1]}/${ddmmyMatch[2]}/${ddmmyMatch[3]}`;

    // Si viene con espacio y tiempo "DD/MM/YYYY HH:MM:SS"
    const ddmmyWithTime = s.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (ddmmyWithTime) return ddmmyWithTime[1];

    // Si tiene 'T' (ISO datetime), tomamos la parte YYYY-MM-DD y convertimos sin ajustar zona
    const tMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (tMatch) return `${tMatch[3]}/${tMatch[2]}/${tMatch[1]}`;

    // Último recurso: intentar Date y usar toLocaleDateString (si no funciona, devolver el string original)
    const dFallback = new Date(s);
    if (!isNaN(dFallback.getTime())) return dFallback.toLocaleDateString();

    return s; // no pudimos parsear: devolvemos original (mejor que crash)
  };

  // ---------- Recolectar fechas para rango (min / max) usando toLocalYYYYMMDD ----------
  const fechas: string[] = [];
  Object.keys(this.ListaAgrupada).forEach((estado) => {
    this.ListaAgrupada[estado].forEach((pedido: any) => {
      if (pedido && pedido.fecha) {
        const f = toLocalYYYYMMDD(pedido.fecha);
        if (f) fechas.push(f);
      }
      // también considerar fecha_entrega si quieres incluirla en el rango:
      // if (pedido && pedido.fecha_entrega) { const fe = toLocalYYYYMMDD(pedido.fecha_entrega); if (fe) fechas.push(fe); }
    });
  });

  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  const formatFecha = (fechaStr: string | null) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // ---------- Preparación para evitar encabezados duplicados por página ----------
  const drawnPages = new Set<number>();
  const addHeaderFooter = (data: any) => {
  const pageNum = data && data.pageNumber ? data.pageNumber : doc.getNumberOfPages();
  if (drawnPages.has(pageNum)) return;
  drawnPages.add(pageNum);

  // Encabezado (solo en la primera página)
  if (pageNum === 1) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text('REPORTE DE PEDIDOS', pageWidth / 2, 40, { align: 'center' });

    doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
   
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(`Informe correspondiente al período del: ${minFechaFormatted || '---'}   al: ${maxFechaFormatted || '---'}`, 40, 85);

    // Línea decorativa
    doc.setDrawColor(0); doc.setLineWidth(1.2);
    doc.line(40, 115, pageWidth - 40, 115);
  }

  // Pie de página (todas las páginas)
  const footerY = pageHeight - 30;
  doc.setDrawColor(200); doc.setLineWidth(0.3);
  doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);

  doc.setFont('helvetica', 'italic');
  doc.text(`Página ${pageNum}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
};

  // ---------- Tu código ORIGINAL, con llamadas a addHeaderFooter y formateo seguro de fechas ----------
  const primaryColor = '#003366';
  const secondaryColor = '#666666';

  let posY = 130;

  Object.keys(this.ListaAgrupada).forEach((estado) => {
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text(`PEDIDO: ${estado.toUpperCase()}`, 40, posY);
    posY += 15;

    // Definir anchos fijos para cada columna (en puntos)
    const columnWidths = {
      0: 10,   // #
      1: 210,  // Datos del Cliente
      2: 96,   // Cantidad Total
      3: 90,   // Precio Total
      4: 160,   // Fecha Hora Registro
      5: 100,   // Fecha Entrega
      6: 40,   // T-R (tiempo restante)
      7: 30,   // Avance
    };

    autoTable(doc, {
      startY: posY,
      head: [['#', 'Datos del Cliente (libreria)', 'Cantidad Total', 'Precio Total', 'Fecha,hora registro', 'Fecha Entrega', 'T-R', 'Avance']],
      body: [],
      styles: {
        fontSize: 8,
        overflow: 'ellipsize',
        cellPadding: 2,
      },
      
      columnStyles: Object.fromEntries(
        Object.entries(columnWidths).map(([key, width]) => [Number(key), { cellWidth: width }])
      ),
      theme: 'grid',
      margin: { left: 40, right: 40,bottom: 80 },
      didDrawPage: (data) => {
        posY = data.cursor!.y + 5;
        addHeaderFooter(data);
      }
    });

    posY += 20;

    this.ListaAgrupada[estado].forEach((pedido, index) => {
      autoTable(doc, {
        startY: posY,
        head: [],
        body: [[
          index + 1,
          `${pedido.libreria?.persona?.nombre || ''} ${pedido.libreria?.persona?.ap_paterno || ''} ${pedido.libreria?.persona?.ap_materno || ''} - (${pedido.libreria?.razon_social || ''})`.trim(),
          (pedido.cantidad_total! / 12) + ' docenas',
          pedido.precio_total + ' Bs',
          // <-- aquí usamos safeFormatFecha para mostrar la fecha sin new Date()
          (pedido.fecha ? `${safeFormatFecha(pedido.fecha)} ${pedido.hora || ''}` : 'Sin fecha') + ' - ' + pedido.persona?.nombre+" "+ pedido.persona?.ap_paterno,
          // <-- fecha_entrega también con safeFormatFecha manteniendo la ternaria
          pedido.fecha_entrega ? safeFormatFecha(pedido.fecha_entrega) : 'Sin fecha',
          pedido.fecha_entrega ? this.getDiasRestantes(pedido.fecha_entrega) + ' días' : 'Sin fecha',
          this.modoDetalle && this.todosDetalles[pedido.idpedido!] ? this.getAvancePedido(pedido.idpedido!) + ' %' : '---',
        ]],
        styles: {
          fontSize: 8,
          overflow: 'ellipsize',
          cellPadding: 2,
        },
        columnStyles: Object.fromEntries(
          Object.entries(columnWidths).map(([key, width]) => [Number(key), { cellWidth: width }])
        ),
        theme: 'grid',
        margin: { left: 40, right: 40 },
        didDrawPage: (data) => {
          posY = data.cursor!.y + 5;
          addHeaderFooter(data);
        }
      });

      if (this.modoDetalle && this.todosDetalles[pedido.idpedido!] && this.todosDetalles[pedido.idpedido!].length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`Detalles del pedido`, 40, posY);
        posY += 15;

        const rowsDetalles = this.todosDetalles[pedido.idpedido!].map((det, i) => [
          i + 1,
          det.catalogo?.nombre || '',
          det.catalogo?.descripcion || '',
          det.cantidad,
          det.catalogo?.precio + ' Bs',
          det.precio_subtotal + ' Bs',
          det.estado === 1 ? 'completado' : 'pendiente',
        ]);

        // Anchos para detalles
        const columnWidthsDetalles = {
          0: 10,
          1: 100,
          2: 180,
          3: 120,
          4: 130,
          5: 130,
          6: 80,
        };

        autoTable(doc, {
          startY: posY,
          head: [['#', 'Nombre', 'Descripcion', 'Cantidad(U)', 'Precio(U)', 'Subtotal', 'Estado']],
          body: rowsDetalles,
          styles: {
            fontSize: 7,
            overflow: 'ellipsize',
            cellPadding: 2,
          },
          columnStyles: Object.fromEntries(
            Object.entries(columnWidthsDetalles).map(([key, width]) => [Number(key), { cellWidth: width }])
          ),
          theme: 'striped',
          margin: { left: 40, right: 40 },
          didDrawPage: (data) => {
            posY = data.cursor!.y + 15;
            addHeaderFooter(data);
          }
        });
      }

      posY += 10;
    });

    posY += 20;
  });

  // Frase de cierre
  doc.setFontSize(9);
  doc.setTextColor(70);
  doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaActual.toLocaleString()}`, 40, posY);


  doc.save(`ReportePedidos_${fecha.replace(/\//g, '-')}.pdf`);
}



@ViewChild('graficoPedidos', { static: false }) graficoPedidosRef!: ElementRef;

generarInformePDF() {
  const doc = new jsPDF('landscape', 'pt', 'A4');
  const fecha = new Date().toLocaleDateString();
  const hora = new Date().toLocaleTimeString();

  const pageWidth = doc.internal.pageSize.getWidth();
  let posY = 40;

  // Título
  doc.setFontSize(16);
  doc.setTextColor('#003366');
  doc.setFont('helvetica', 'bold');
  doc.text('Informe Resumen de Pedidos', pageWidth / 2, posY, { align: 'center' });
  posY += 20;

  // Info general
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${fecha}`, 40, posY);
  doc.text(`Hora: ${hora}`, pageWidth - 40, posY, { align: 'right' });
  posY += 20;

  // Dibujar resumen
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text(`Total Pedidos: ${this.totalPedidos}-P`, 40, posY); posY += 15;
  doc.text(`Pendientes: ${this.totalPendientes}-P`, 40, posY); posY += 15;
  doc.text(`En proceso: ${this.totalEnProceso}-P`, 40, posY); posY += 15;
  doc.text(`Efectividad: ${this.efectividad} %`, 40, posY); posY += 25;

  // Capturar gráfico como imagen
  const canvasEl: HTMLCanvasElement = this.graficoPedidosRef?.nativeElement;

  if (canvasEl) {
    const imgData = canvasEl.toDataURL('image/png', 1.0);
    // Insertar imagen del gráfico
    const imgWidth = 400;
    const imgHeight = 200;
    const imgX = pageWidth - imgWidth - 40;
    const imgY = 100;

    doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);
  }

  // Mensaje final
  doc.setFontSize(9);
  doc.setTextColor(70);
  doc.text('Este informe fue generado automáticamente por el sistema LUCIweb.', 40, doc.internal.pageSize.getHeight() - 40);

  // Guardar
  doc.save(`InformeResumen_${fecha.replace(/\//g, '-')}.pdf`);
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

seguimiento(): void {
  this.mostrarFiltros2 = !this.mostrarFiltros2;
}

mostrarFiltros3: boolean = false;

resumen(): void {
  this.mostrarFiltros3 = !this.mostrarFiltros3;
}
}
