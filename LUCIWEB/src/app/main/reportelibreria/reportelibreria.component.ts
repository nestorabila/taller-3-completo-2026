import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportelibreria',
  standalone: true,
  imports: [CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
   providers: [ConfirmationService, MessageService],
  templateUrl: './reportelibreria.component.html',
   styleUrls: ['./reportelibreria.component.css']
})
export class ReportelibreriaComponent {

  listaLibreria: Negocio[] = [];
  listaCiudad: Ciudad[]=[];
castToNegocioArray(value: unknown): Negocio[] {
  return value as Negocio[];
}

     constructor(private libreService: NegocioService, private ciudadService: CuidadService,
        private httpClient: HttpClient, private formBuilder: FormBuilder) {
       } 
modelCiudad() {
  this.ciudadService.ListarCuidad().subscribe((res) => {
    console.log('Lista de ciudades:', res); // <-- Log de verificación
    this.listaCiudad = res;
  });
}

modelLibreria() {
  const filtros: any = {};

  if (this.ciudadFiltro) {
    filtros.idciudad = this.ciudadFiltro;
  }
  if (this.nombreFiltro) {
    filtros.razon_social = this.nombreFiltro;
  }
  if (this.fechaDesdeFiltro) {
    filtros.desde = this.fechaDesdeFiltro;
  }
  if (this.fechaHastaFiltro) {
    filtros.hasta = this.fechaHastaFiltro;
  }

  this.libreService.ListarReporteNegocio(filtros).subscribe((res) => {
    console.log('Datos librerías:', res);
    this.listaLibreria = res;

    // Agrupación por ciudad
    this.libreriasPorCiudad = this.groupByCiudad(res);
  });
}

// Agrupar por ciudad


groupByCiudad(data: Negocio[]): Record<string, Negocio[]> {
  const grouped: Record<string, Negocio[]> = {};
  for (const item of data) {
    const nombreCiudad = item.ciudad?.nombre || 'Sin Ciudad';
    if (!grouped[nombreCiudad]) {
      grouped[nombreCiudad] = [];
    }
    grouped[nombreCiudad].push(item);
  }
  return grouped;
}


libreriasPorCiudad: Record<string, Negocio[]> = {};

ngOnInit(): void {
  this.modelCiudad();
  this.modelLibreria();
 }
 ciudadFiltro: string = '';
nombreFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

exportarExcel() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString().replace(/\//g, '-');

  const columnas = ['Nro', 'NIT', 'Razón Social', 'Teléfono', 'Dirección', 'Cliente', 'Fecha', 'Hora', 'Estado'];

  let contador = 1;
  const fechas: string[] = [];

  // Recorrer librerías agrupadas por ciudad
  Object.entries(this.libreriasPorCiudad).forEach(([ciudad, librerias]) => {
    ws_data.push([`CIUDAD: ${ciudad.toUpperCase()}`]); // fila de ciudad
    ws_data.push(columnas); // encabezado de columnas

    librerias.forEach((libreria: any) => {
      ws_data.push([
        contador++,
        libreria.nit || 'S/N',
        libreria.razon_social || 'Sin razón social',
        libreria.telefono || 'Sin teléfono',
        libreria.direccion || 'Sin dirección',
        `${libreria.persona?.nombre || ''} ${libreria.persona?.ap_paterno || ''} ${libreria.persona?.ap_materno || ''}`.trim() || 'Sin cliente',
        libreria.fecha?.split('-').reverse().join('/') || 'Sin fecha',
        libreria.hora || 'Sin hora',
        libreria.estado == 1 ? 'Activo' : 'Pendiente',
      ]);

      if (libreria.fecha) fechas.push(libreria.fecha.toString());
    });

    ws_data.push(['']); // fila vacía entre ciudades
  });

  // Calcular rango de fechas
  const minFecha = fechas.length ? fechas.reduce((a,b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a,b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y,m,d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Encabezado general
  const titulo = 'REPORTE DE LIBRERÍAS';
  ws_data.unshift(
    [titulo],
    [''],
    [`Informe correspondiente al período del: ${minFechaFormatted || '---'} al: ${maxFechaFormatted || '---'}`],
    ['']
  );

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

  // Definir merges
  if (!ws['!merges']) ws['!merges'] = [];
  const maxCols = columnas.length;
  const merges = ws['!merges'] as XLSX.Range[];

  // Merge título y subtítulo
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } });
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: maxCols - 1 } });

  // Merge filas de ciudad
  ws_data.forEach((row, rIdx) => {
    const cell = row[0];
    if (typeof cell === 'string' && cell.startsWith('CIUDAD:')) {
      merges.push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: maxCols - 1 } });
    }
  });

  ws['!merges'] = merges;

  // Ajustar ancho de columnas
  ws['!cols'] = Array(maxCols).fill({ wch: 20 });

  // Pie de página
  ws_data.push(['']);
  ws_data.push([`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`]);
  const lastIdx = ws_data.length - 1;
  ws['!merges'].push({ s: { r: lastIdx, c: 0 }, e: { r: lastIdx, c: maxCols - 1 } });

  // Añadir hoja
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Librerías');

  // Descargar Excel
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_librerias_${fechaTexto}.xlsx`);
}

exportarPDF() {
  const doc = new jsPDF('p', 'pt', 'a4');

  const fechaHora = new Date().toLocaleString();

  const columnas = [
    { header: 'Nro', dataKey: 'nro' },
    { header: 'NIT', dataKey: 'nit' },
    { header: 'Razón Social', dataKey: 'razon' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Hora', dataKey: 'hora' },
    { header: 'Estado', dataKey: 'estado' }
  ];

  const filas: any[] = [];
  let contador = 1;

  // 🔹 Guardamos las fechas como cadenas
  const fechas: string[] = [];

  Object.entries(this.libreriasPorCiudad).forEach(([ciudad, librerias]) => {
    filas.push({
      nro: { content: `CIUDAD: ${ciudad.toUpperCase()}`, colSpan: 9, styles: { halign: 'left', fillColor: [220, 220, 220], fontStyle: 'bold' } }
    });

    librerias.forEach((libreria: any) => {
      filas.push({
        nro: contador++,
        nit: libreria.nit || 'S/N',
        razon: libreria.razon_social || 'Sin razón social',
        telefono: libreria.telefono || 'Sin teléfono',
        direccion: libreria.direccion || 'Sin dirección',
        cliente: `${libreria.persona?.nombre || ''} ${libreria.persona?.ap_paterno || ''} ${libreria.persona?.ap_materno || ''}`.trim() || 'Sin cliente',
        fecha: libreria.fecha?.split('-').reverse().join('/') || 'Sin fecha',
        hora: libreria.hora || 'Sin hora',
        estado: libreria.estado == 1 ? 'Activo' : 'Pendiente',
      });

      if (libreria.fecha) fechas.push(libreria.fecha.toString());
    });
  });

  // 🔹 Calculamos fecha mínima y máxima
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  // 🔹 Función para formatear DD/MM/YYYY desde la cadena YYYY-MM-DD
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

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
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text('REPORTE DE LIBRERÍAS', pageWidth / 2, 40, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const ciudadNombre = this.obtenerNombreCiudad(this.ciudadFiltro);
      const filtros = `: ${minFechaFormatted || '---'} al: ${maxFechaFormatted || '---'}`;
      doc.text(`Informe correspondiente al período del ${filtros}`, 40, 85);

      // Línea decorativa
      doc.setDrawColor(0); doc.setLineWidth(1.2);
      doc.line(40, 115, pageWidth - 40, 115);

      // Pie de página
      const footerY = pageHeight - 30;
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    

      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
       if (data.pageNumber === doc.getNumberOfPages()) {
       const finalY = (data.cursor?.y ?? 150) + 20
        doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`, 40, finalY);
      }
    }
  });

  // Guardar PDF
  doc.save(`reporte_librerias.pdf`);
}

obtenerNombreCiudad(codigo: string): string {
  const idCiudad = Number(codigo);
  const ciudad = this.listaCiudad.find(c => c.idciudad === idCiudad);
  return ciudad ? ciudad.nombre : 'Todas';
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