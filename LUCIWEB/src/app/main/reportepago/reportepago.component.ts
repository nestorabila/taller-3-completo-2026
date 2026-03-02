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
import { Pago } from 'src/app/model/pago';

@Component({
  selector: 'app-reportepago',
   imports: [NgChartsModule,CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
       providers: [ConfirmationService, MessageService],
  templateUrl: './reportepago.component.html',
  styleUrls: ['./reportepago.component.css']
})
export class ReportepagoComponent {
 
  modoDetalle: boolean = false;

  nombreFiltro: string = '';
  estadoFiltro: string = '';
  fechaDesdeFiltro: string = '';
  fechaHastaFiltro: string = '';
  
  listaPago: Pago[] = [];
  
  
  // Ahora cada grupo tiene la forma: { pagos: Pago[], total: number }
 
  // Ahora cada grupo tiene la forma: { pagos: Pago[], total: number; subtotal?: number; faltante?: number }
  ListaAgrupada: { [key: string]: { pagos: Pago[]; total: number; subtotal?: number; faltante?: number } } = {};
  
  constructor(
    private pedidoService: PedidoService,
    private detpedidoService: DetallePedidoService,
    private httpClient: HttpClient,
    private formBuilder: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.modelPago();
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
  
  
  // Agrupar por estado y cargar detalles si se requiere
  modelPago() {
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
  
    this.pedidoService.ListarReportePago(params).subscribe((fall: any) => {
      console.log("lista de pagos", fall);
      // El backend devuelve { data: [...], totalRegistros, totalPagado }
      const arr: Pago[] = Array.isArray(fall) ? fall : (fall && Array.isArray(fall.data)) ? fall.data : [];
      this.listaPago = arr.sort((a, b) => (b.idpago ?? 0) - (a.idpago ?? 0));

      // Agrupar por pedido (un pedido puede tener varios pagos parciales)
      const rawGroups = this.listaPago.reduce((gr: any, pago: Pago) => {
        const pedido = pago.pedido;
        const idPedido = pedido && pedido.idpedido != null ? String(pedido.idpedido) : 'SinPedido';
        const razon = pedido?.libreria?.razon_social || (pedido?.libreria?.persona ? `${pedido!.libreria!.persona!.nombre} ${pedido!.libreria!.persona!.ap_paterno || ''}`.trim() : 'Cliente desconocido');
        const key = `#${idPedido} - ${razon}`;

        if (!gr[key]) {
          gr[key] = [];
        }

        gr[key].push(pago);
        return gr;
      }, {});

      const groupedWithTotals: any = {};
      for (const k of Object.keys(rawGroups)) {
        const pagosArr: Pago[] = rawGroups[k];
        // Sumar solo pagos con estado === 1 (activos). Estado 0 = anulado y no se suma.
        const total = pagosArr.reduce((s, p) => s + ((p.estado === 1) ? (p.monto || 0) : 0), 0);
        // Intentar obtener el subtotal (monto total a pagar) del pedido
        // puede venir en cada pago como precio_subtotal o en pago.pedido?.precio_subtotal
        let subtotal: number | undefined = undefined;
        for (const p of pagosArr) {
          if (p['precio_subtotal'] != null) {
            subtotal = Number(p['precio_subtotal']);
            break;
          }
          if (p.pedido && (p.pedido as any).precio_subtotal != null) {
            subtotal = Number((p.pedido as any).precio_subtotal);
            break;
          }
        }

        const faltante = subtotal != null ? Math.max(0, subtotal - total) : undefined;

        groupedWithTotals[k] = { pagos: pagosArr, total, subtotal, faltante };
      }

      this.ListaAgrupada = groupedWithTotals;
  
      // Si está activado el modo detalle, cargar detalles
      
    });
  }



exportarPDF() {
  const doc = new jsPDF('p', 'pt', 'a4');
  const fechaHora = new Date().toLocaleString();
  const pageWidth = doc.internal.pageSize.getWidth();

  const columnas = [
    { header: '#', dataKey: 'nro' },
    { header: 'Nombre Cliente', dataKey: 'cliente' },
    { header: 'Monto Bs.', dataKey: 'monto', styles: { halign: 'right' } },
    { header: 'Fecha Hora', dataKey: 'fechaHora' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Recibido por', dataKey: 'recibido' },
  ];

  const filas: any[] = [];
  let contadorGlobal = 1;
  const fechas: string[] = [];
  let totalPagos = 0;

  // Preparar filas de datos
  Object.entries(this.ListaAgrupada).forEach(([key, grupo]: any) => {
    // Cabecera de pedido
    filas.push({
      nro: { content: `Pedido: ${key}`, colSpan: 7, styles: { halign: 'center', fillColor: [240, 240, 240] } }
    });

    // Filas de pagos
    grupo.pagos.forEach((pago: any) => {
      filas.push({
        nro: contadorGlobal++,
        cliente: `${pago.pedido?.libreria?.razon_social || ''} - ${pago.pedido?.libreria?.persona?.nombre || ''} ${pago.pedido?.libreria?.persona?.ap_paterno || ''}`.trim(),
        monto: { content: (pago.monto || 0).toFixed(2), styles: { halign: 'right' } },
        fechaHora: `${pago.fecha?.split('-').reverse().join('/') || ''} ${pago.hora || ''}`,
        estado: pago.estado === 1 ? 'Activo' : 'Anulado',
        recibido: `${pago.persona?.nombre || ''} ${pago.persona?.ap_paterno || ''}`.trim(),
      });

      if (pago.estado === 1) totalPagos += pago.monto || 0;
      if (pago.fecha) fechas.push(pago.fecha.toString());
    });

    // Fila de totales por pedido (color gris uniforme)
    const fillGray = [220, 220, 220];
    filas.push({
      nro: { content: '', styles: { fillColor: fillGray } },
      cliente: { content: '', styles: { fillColor: fillGray } },
      monto: { content: grupo.total?.toFixed(2) || '0.00', styles: { halign: 'right', fontStyle: 'bold', fillColor: fillGray } },
      fechaHora: { content: grupo.subtotal != null ? 'Total Pagar: ' + grupo.subtotal + ' Bs' : '-', styles: { halign: 'right', fontStyle: 'bold', fillColor: fillGray } },
      estado: { content: grupo.faltante != null ? 'Restante: ' + grupo.faltante + ' Bs' : '-', styles: { halign: 'right', fontStyle: 'bold', fillColor: fillGray } },
      recibido: { content: '', styles: { fillColor: fillGray } },
    });
  });

  // Fechas del reporte
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Generar tabla
  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 150,
    styles: { fontSize: 8 },
    theme: 'grid',
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.getHeight();

      // ENCABEZADO SOLO PRIMERA PÁGINA
      if (data.pageNumber === 1) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
        doc.text('REPORTE DE PAGOS', pageWidth / 2, 40, { align: 'center' });

        doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
        doc.text('“Estos son los reportes de los pagos según el seguimiento realizado”', pageWidth / 2, 60, { align: 'center' });

        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        doc.text(`Informe correspondiente al período del: ${minFechaFormatted}   al: ${maxFechaFormatted}`, 40, 85);

        doc.setFont('helvetica', 'bold');
        doc.text(`Total Pagos: ${totalPagos.toFixed(2)}`, pageWidth - 40, 105, { align: 'right' });

        doc.setDrawColor(0); doc.setLineWidth(1.2);
        doc.line(40, 115, pageWidth - 40, 115);
      }

      // PIE DE PÁGINA SOLO ÚLTIMA PÁGINA
      if (data.pageNumber === doc.getNumberOfPages()) {
        const footerY = pageHeight - 30;
        doc.setDrawColor(200); doc.setLineWidth(0.3);
        doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);

        doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
        doc.text(`Página ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });

        const finalY = (data.cursor?.y ?? 150) + 20;
        doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`, 40, finalY);
      }
    }
  });

  // Guardar PDF
  doc.save('reporte_seguimiento_pagos.pdf');
}


exportarExcel() {
  const wsData: any[][] = [];

  // Encabezados (idénticos a la tabla)
  wsData.push([
    '#',
    'Nombre Cliente',
    'Monto Bs.',
    'Fecha Hora',
    'Estado',
    'Recibido por'
  ]);

  let contadorGlobal = 1;

  Object.entries(this.ListaAgrupada).forEach(([key, grupo]: any) => {

    // ====== FILA CABECERA PEDIDO ======
    wsData.push([`Pedido: ${key}`, '', '', '', '', '']);

    // ====== FILAS DE PAGOS ======
    grupo.pagos.forEach((pago: any) => {
      wsData.push([
        contadorGlobal++,
        `${pago.pedido?.libreria?.razon_social || ''} - ${pago.pedido?.libreria?.persona?.nombre || ''} ${pago.pedido?.libreria?.persona?.ap_paterno || ''}`.trim(),
        Number((pago.monto || 0).toFixed(2)),
        `${pago.fecha?.split('-').reverse().join('/') || ''} ${pago.hora || ''}`,
        pago.estado === 1 ? 'Activo' : 'Anulado',
        `${pago.persona?.nombre || ''} ${pago.persona?.ap_paterno || ''}`.trim()
      ]);
    });

    // ====== FILA DE TOTALES (MISMA FILA COMO EN PDF/HTML) ======
    wsData.push([
      '',
      '',
      Number((grupo.total || 0).toFixed(2)),
      grupo.subtotal != null ? `Total Pagar: ${grupo.subtotal} Bs` : '-',
      grupo.faltante != null ? `Restante: ${grupo.faltante} Bs` : '-',
      ''
    ]);
  });

  // Crear hoja y libro
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Pagos');

  // ====== ESTILOS (xlsx no es perfecto, pero esto ayuda) ======
  const range = XLSX.utils.decode_range(ws['!ref']!);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: { name: 'Arial', sz: 10 },
        alignment: {
          vertical: 'center',
          horizontal: C === 2 || C === 3 || C === 4 ? 'right' : 'left'
        }
      };
    }
  }

  // Ancho de columnas (prolijo)
  ws['!cols'] = [
    { wch: 5 },
    { wch: 45 },
    { wch: 15 },
    { wch: 22 },
    { wch: 15 },
    { wch: 25 }
  ];

  // Exportar archivo
  const excelBuffer: any = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  const data: Blob = new Blob([excelBuffer], {
    type: 'application/octet-stream'
  });

  saveAs(data, 'reporte_seguimiento_pagos.xlsx');
}



}