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

@Component({
  selector: 'app-reportecatecatalogo',
  standalone: true,
    imports: [CommonModule, FieldsetModule,AvatarModule,SplitterModule, ReactiveFormsModule, FormsModule],
     providers: [ConfirmationService, MessageService],
  templateUrl: './reportecatecatalogo.component.html',
  styleUrl: './reportecatecatalogo.component.css'
})
export class ReportecatecatalogoComponent {
   
  listaCategoria: Categoria[]=[];
  listaCatalogo: Catalogo[]=[];
   constructor(private categoriaService: CategoriaService, private cataService: CatalogoService, private httpClient: HttpClient, private formBuilder: FormBuilder) {} 
  modelCategoria() {
  this.categoriaService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria = fall.filter(p => p.estado === 1);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
    
  });
}
ListaAgrupada: {
  [Categoria: string]: {
    [estado: string]: Catalogo[];
  };
} = {};

modelCatalogo() {
  // Se mandan todos los filtros con valores explícitos (incluso 0 si corresponde)
  const params: any = {};

  if (this.tipoFiltro !== undefined && this.tipoFiltro !== '') {
    params.categoria = this.tipoFiltro;
  }

  if (this.nombreFiltro !== undefined && this.nombreFiltro !== '') {
    params.nombre = this.nombreFiltro;
  }

  if (this.estadoFiltro !== undefined && this.estadoFiltro !== '') {
    params.estado = this.estadoFiltro;
  }

  if (this.destacadoFiltro !== undefined && this.destacadoFiltro !== '') {
    params.destacado = this.destacadoFiltro;
  }

  if (this.fechaDesdeFiltro) {
    params.fechaDesde = this.fechaDesdeFiltro;
  }

  if (this.fechaHastaFiltro) {
    params.fechaHasta = this.fechaHastaFiltro;
  }

  this.cataService.ListarReporteCatalogo(params).subscribe((fall) => {
    this.listaCatalogo = fall
      .sort((a, b) => b.idcatalogo - a.idcatalogo);

    // Agrupación por Categoria y estado
    this.ListaAgrupada = this.listaCatalogo.reduce(
      (acc: Record<string, Record<string, Catalogo[]>>, catalogo: Catalogo) => {
        const nombreCategoria = catalogo.categoria?.nombre || 'Sin Categoría';
        const estadoTexto = catalogo.estado === 1 ? 'Activo' : 'Inactivo';

        if (!acc[nombreCategoria]) {
          acc[nombreCategoria] = {};
        }

        if (!acc[nombreCategoria][estadoTexto]) {
          acc[nombreCategoria][estadoTexto] = [];
        }

        acc[nombreCategoria][estadoTexto].push(catalogo);
        return acc;
      },
      {}
    );
  });
}

// Total general de catálogos
get totalCatalogos(): number {
  return this.listaCatalogo.length;
}

// Total de catálogos activos
get catalogosActivos(): number {
  return this.listaCatalogo.filter(c => c.estado === 1).length;
}

// Total de catálogos inactivos
get catalogosInactivos(): number {
  return this.listaCatalogo.filter(c => c.estado === 0).length;
}

// Total de categorías
get totalCategorias(): number {
  return this.listaCategoria.length;
}

// Total de catálogos destacados
get catalogosDestacados(): number {
  return this.listaCatalogo.filter(c => c.destacado === 1).length;
}

// Total de catálogos no destacados
get catalogosNoDestacados(): number {
  return this.listaCatalogo.filter(c => c.destacado === 0).length;
}

  ngOnInit(): void {
  this.modelCategoria();
  this.modelCatalogo();
 }

tipoFiltro: string = '';
estadoFiltro: string= '';
destacadoFiltro: string='';
nombreFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

exportarExcel() {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];

  // Fecha/hora para pie
  const fechaHora = new Date().toLocaleString();

  // Extraer fechas (con cast para evitar errores de tipos)
  const fechas: string[] = [];
  const listaAgrupada = this.ListaAgrupada as Record<string, Record<string, any[]>>;
  Object.values(listaAgrupada).forEach((estados) => {
    Object.values(estados).forEach((items) => {
      items.forEach((item) => {
        if (item && item.fecha) fechas.push(String(item.fecha));
      });
    });
  });

  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';
  const formatFecha = (f: string) => f ? f.split('-').reverse().join('/') : '---';
  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  // Encabezado (igual al PDF)
  ws_data.push([ 'REPORTE DE CATÁLOGO' ]);           // fila 0 (merge A1:F1)
  ws_data.push([ '' ]);                              // fila 1
  ws_data.push([ `Informe correspondiente al período del: ${minFechaFormatted}  al: ${maxFechaFormatted}` ]); // fila 2 (merge)
  ws_data.push([ '' ]);                              // fila 3

  const headers = ['#', 'Nombre', 'Descripción', 'Precio (U)', 'Fecha', 'Hora'];

  // Recorrer categorías y estados (como en tu PDF)
  Object.keys(listaAgrupada).forEach((categoria) => {
    ws_data.push([ `CATEGORÍA: ${categoria.toUpperCase()}` ]);
    const estados = listaAgrupada[categoria];
    Object.keys(estados).forEach((estado) => {
      ws_data.push([ `Estado: ${estado}` ]);
      ws_data.push(headers);

      const filas = (estados[estado] as any[]).map((item: any, idx: number) => [
        idx + 1,
        item.destacado === 1 ? `${item.nombre}  ::destacado::` : item.nombre,
        item.descripcion || 'sin descripción',
        item.precio != null ? `${item.precio} Bs.` : '',
        item.fecha?.split('-').reverse().join('/') || '',
        item.hora || ''
      ]);

      // añadir filas
      filas.forEach(r => ws_data.push(r));
    });
  });

  // Pie de página
  ws_data.push(['']); // fila vacía antes del pie
  ws_data.push([`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora}`]);

  // Convertir a hoja
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);

  // Definir merges (título, rango de fechas, cada categoría/estado)
  if (!ws['!merges']) ws['!merges'] = [];

  // Merge título (A1:F1) y rango de fechas (A3:F3) -- índices 0-based
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }); // fila 0
  ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: headers.length - 1 } }); // fila 2

  // Ahora añadir merges para cada "CATEGORÍA" y "Estado"
  // Recorremos ws_data para localizar filas que empiezan por "CATEGORÍA:" o "Estado:"
  ws_data.forEach((row, rIdx) => {
    const first = row && row[0] ? String(row[0]) : '';
    if (first.startsWith('CATEGORÍA:') || first.startsWith('Estado:')) {
      // fusionar A{rIdx+1}:F{rIdx+1}
      (ws['!merges'] as XLSX.Range[]).push({ s: { r: rIdx, c: 0 }, e: { r: rIdx, c: headers.length - 1 } });
    }
  });

  // Ajustar anchos de columnas (puedes modificar wch para más espacio)
  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 12) }));

  // Agregar hoja al libro y descargar
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte Catálogo');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const fechaTexto = new Date().toLocaleDateString().replace(/\//g, '-');
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_catalogo_${fechaTexto}.xlsx`);
}
exportarPDF() {
  const doc = new jsPDF('landscape', 'pt', 'A4');
  const fechaHora = new Date().toLocaleString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Extraer fechas del catálogo (si aplica)
  const fechas: string[] = [];
  (Object.values(this.ListaAgrupada) as any[]).forEach((estados: any) => {
    (Object.values(estados) as any[]).forEach((items: any[]) => {
      items.forEach((item: any) => {
        if (item.fecha) fechas.push(item.fecha.toString());
      });
    });
  });

  // Calcular fecha mínima y máxima
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  // Función para formatear
  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  autoTable(doc, {
    startY: 150,
    body: [], // se generará tabla dentro del recorrido de categorías
    didDrawPage: (data) => {
      // Encabezado
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text('REPORTE DE CATÁLOGO', pageWidth / 2, 40, { align: 'center' });

      doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
     
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.text(`Informe correspondiente al período del: ${minFechaFormatted}   al: ${maxFechaFormatted}`, 40, 85);

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
    }
  });

  let posY = 150;

  // Recorrer categorías
  Object.keys(this.ListaAgrupada).forEach((categoria) => {
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text(`CATEGORÍA: ${categoria.toUpperCase()}`, 40, posY);
    posY += 10;

    const estados = this.ListaAgrupada[categoria];
    Object.keys(estados).forEach((estado) => {
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`Estado: ${estado}`, 50, posY);
      posY += 5;

      // Datos de la tabla
      const rows = estados[estado].map((item: any, index: number) => [
        index + 1,
        item.destacado === 1 ? `${item.nombre}  ::destacado::` : item.nombre,
        item.descripcion || 'sin descripción',
        `${item.precio} Bs.`,
        item.fecha?.split('-').reverse().join('/'),
        item.hora
      ]);

      autoTable(doc, {
        startY: posY,
        head: [['#', 'Nombre', 'Descripción', 'Precio (U)', 'Fecha', 'Hora']],
        body: rows,
        styles: { fontSize: 8 },
        theme: 'grid',
        margin: { left: 50, right: 40 },
        didDrawPage: (data: any) => {
          posY = data.cursor.y + 20;
        }
      });
    });
  });
// Frase de cierre
  doc.setFontSize(9);
  doc.setTextColor(70);
  doc.text(`Generado por: LiciWeb, Norma Maizares, Fecha: ${fechaHora.toLocaleString()}`, 40, posY);

  // Guardar PDF
  doc.save('reporte_catalogo.pdf');
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
