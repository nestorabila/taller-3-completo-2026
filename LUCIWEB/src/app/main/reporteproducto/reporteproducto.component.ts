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
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { saveAs } from 'file-saver';
import { Catalogo } from 'src/app/model/catalogo';
import { Categoria } from 'src/app/model/categoria';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { Producto } from 'src/app/model/producto';
import { ProductoService } from 'src/app/servicio/producto.service';
@Component({
  selector: 'app-reporteproducto',
  imports: [CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
       providers: [ConfirmationService, MessageService],
  templateUrl: './reporteproducto.component.html',
  styleUrl: './reporteproducto.component.css'
})
export class ReporteproductoComponent {
  get totalProductos(): number {
  return this.listaProducto.length;
}

get totalCategorias(): number {
  return this.listaCategoria.length;
}

listaCategoria: Categoria[]=[];
  listaProducto: Producto[]=[];
   constructor(private categoriaService: CategoriaService, private prodService: ProductoService, private httpClient: HttpClient, private formBuilder: FormBuilder) {} 
  modelCategoria() {
  this.categoriaService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria = fall.filter(p => p.estado === 0);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
    
  });
}
ListaAgrupada: {
  [Categoria: string]: Producto[];
} = {};


modelProducto() {
  // Se mandan todos los filtros con valores explícitos (incluso 0 si corresponde)
  const params: any = {};

  if (this.tipoFiltro !== undefined && this.tipoFiltro !== '') {
    params.categoria = this.tipoFiltro;
  }

  if (this.nombreFiltro !== undefined && this.nombreFiltro !== '') {
    params.nombre = this.nombreFiltro;
  }


  if (this.fechaDesdeFiltro) {
    params.fechaDesde = this.fechaDesdeFiltro;
  }

  if (this.fechaHastaFiltro) {
    params.fechaHasta = this.fechaHastaFiltro;
  }

  this.prodService.ListarReporteProducto(params).subscribe((fall) => {
    this.listaProducto = fall
      .sort((a, b) => b.idproducto - a.idproducto);

    // Agrupación por Categoria y estado
    this.ListaAgrupada = this.listaProducto.reduce(
  (acc: Record<string, Producto[]>, catalogo: Producto) => {
    const nombreCategoria = catalogo.categoria?.nombre || 'Sin Categoría';

    if (!acc[nombreCategoria]) {
      acc[nombreCategoria] = [];
    }

    acc[nombreCategoria].push(catalogo);
    return acc;
  },
  {}
);

  });
}


  ngOnInit(): void {
  this.modelCategoria();
  this.modelProducto();
 }

tipoFiltro: string = '';
nombreFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

exportarPDF() {
  const doc = new jsPDF('landscape', 'pt', 'A4');

  const fechaHora = new Date().toLocaleString();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const filas: any[] = [];
  let contador = 1;

  // 🔹 Guardamos las fechas como cadenas
  const fechas: string[] = [];

  Object.keys(this.ListaAgrupada).forEach((categoria) => {
    filas.push({
      nro: { content: `CATEGORÍA: ${categoria.toUpperCase()}`, colSpan: 5, styles: { halign: 'left', fillColor: [220, 220, 220], fontStyle: 'bold' } }
    });

    const productos = this.ListaAgrupada[categoria];

    productos.forEach((prod: any) => {
      filas.push({
        nro: contador++,
        nombre: prod.nombre || 'Sin nombre',
        descripcion: prod.descripcion || 'Sin descripción',
        fecha: prod.fecha?.split('-').reverse().join('/') || 'Sin fecha',
        hora: prod.hora || 'Sin hora'
      });

      if (prod.fecha) fechas.push(prod.fecha.toString());
    });
  });

  // 🔹 Calculamos fecha mínima y máxima
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  // 🔹 Función para formatear DD/MM/YYYY desde YYYY-MM-DD
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  const columnas = [
    { header: 'Nro', dataKey: 'nro' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Hora', dataKey: 'hora' }
  ];

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 150,
    styles: { fontSize: 8 },
    theme: 'grid',
    didDrawPage: (data) => {

      // Encabezado
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text('REPORTE DE PRODUCTOS', pageWidth / 2, 40, { align: 'center' });

      doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
     
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.text(`Informe correspondiente al período del: ${minFechaFormatted || '---'}   al: ${maxFechaFormatted || '---'}`, 40, 85);

      // Línea decorativa
      doc.setDrawColor(0); doc.setLineWidth(1.2);
      doc.line(40, 115, pageWidth - 40, 115);

      // Pie de página
      const footerY = pageHeight - 30;
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);

      doc.setFont('helvetica', 'italic');
      doc.text(`Página ${data.pageNumber}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
      if (data.pageNumber === doc.getNumberOfPages()) {
        const finalY = (data.cursor?.y ?? 150) + 20;
        doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`, 40, finalY);
      }
    }
  });

  // Guardar PDF
  doc.save('reporte_productos.pdf');
}

exportarExcel() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString().replace(/\//g, '-');

  const columnas = ['Nro', 'Nombre', 'Descripción', 'Fecha', 'Hora'];

  let contador = 1;
  const fechas: string[] = [];

  // Recorrer categorías agrupadas
  Object.keys(this.ListaAgrupada).forEach((categoria) => {
    ws_data.push([`CATEGORÍA: ${categoria.toUpperCase()}`]); // fila de categoría
    ws_data.push(columnas); // encabezado de columnas

    const productos = this.ListaAgrupada[categoria];

    productos.forEach((prod: any) => {
      ws_data.push([
        contador++,
        prod.nombre || 'Sin nombre',
        prod.descripcion || 'Sin descripción',
        prod.fecha?.split('-').reverse().join('/') || 'Sin fecha',
        prod.hora || 'Sin hora'
      ]);

      if (prod.fecha) fechas.push(prod.fecha.toString());
    });

    ws_data.push(['']); // fila vacía entre categorías
  });

  // Calcular rango de fechas
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Encabezado general
  const titulo = 'REPORTE DE PRODUCTOS';
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

  // Merge filas de categoría
  ws_data.forEach((row, rIdx) => {
    const cell = row[0];
    if (typeof cell === 'string' && cell.startsWith('CATEGORÍA:')) {
      merges.push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: maxCols - 1 } });
    }
  });

  ws['!merges'] = merges;

  // Ajustar ancho de columnas
  ws['!cols'] = Array(maxCols).fill({ wch: 25 });

  // Pie de página
  ws_data.push(['']);
  ws_data.push([`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`]);
  const lastIdx = ws_data.length - 1;
  ws['!merges'].push({ s: { r: lastIdx, c: 0 }, e: { r: lastIdx, c: maxCols - 1 } });

  // Añadir hoja
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Productos');

  // Descargar Excel
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_productos_${fechaTexto}.xlsx`);
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
