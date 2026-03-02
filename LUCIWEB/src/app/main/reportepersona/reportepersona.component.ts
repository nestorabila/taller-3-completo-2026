import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterService, FilterMatchMode, ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FieldsetModule } from 'primeng/fieldset';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient } from '@angular/common/http';
import { Persona } from 'src/app/model/persona';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { RolService } from 'src/app/servicio/rol.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-reportepersona',
   imports: [FieldsetModule,AvatarModule,SplitterModule, TooltipModule, InputSwitchModule, NgxPaginationModule,  RadioButtonModule, ReactiveFormsModule, FormsModule, InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
       providers: [ConfirmationService, MessageService],
  templateUrl: './reportepersona.component.html',
  styleUrls: ['./reportepersona.component.css'],
})
export class ReportepersonaComponent {
 listaPersona: Persona[] = [];
   constructor(private PerService: PersonaService, private credeService: CredencialService,
     private rolService: RolService,  private httpClient: HttpClient, private formBuilder: FormBuilder) {
     } 
personasPorRolEstado: {
  [rol: string]: {
    [estado: string]: Persona[];
  };
} = {};

  modelPersona() {
  const params = {
    rol: this.rolFiltro || '',
    nombre: this.nombreFiltro || '',
    estado: this.estadoFiltro || '',
    fechaDesde: this.fechaDesdeFiltro || '',
    fechaHasta: this.fechaHastaFiltro || ''
  };

  this.PerService.ListarReportePersona(params).subscribe((fall) => {
   this.listaPersona = fall
  .filter(p => p.rol?.some(a=> a.idrol !== 1))
  .sort((a, b) => b.idpersona - a.idpersona);

this.personasPorRolEstado = this.listaPersona.reduce(
  (acc: Record<string, Record<string, Persona[]>>, persona: Persona) => {
   const nombreRol = persona.rol?.map(r => r.nombre).join(', ') || 'Sin Rol';

    const estadoStr = persona.estado === 1 ? 'Activo' : 'Bloqueado';

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
rolFiltro: string = '';
nombreFiltro: string = '';
estadoFiltro: string = '';
fechaDesdeFiltro: string = '';
fechaHastaFiltro: string = '';

 ngOnInit(): void {
  this.modelPersona()
 }
exportarExcel() {
  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString();
  const fechaBoleta = fechaTexto.replace(/\//g, '-');

  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  const ws_data: any[][] = [];
  let rowIndex = 0;

  const mergeRanges: XLSX.Range[] = [];

  // Primera fila: Título centrado
  ws_data[rowIndex] = [];
  ws_data[rowIndex][0] = 'REPORTE DE PERSONAS';
  mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } }); // A1:I1
  rowIndex++;

  // Segunda fila: Rango de fechas
  const fechas: string[] = [];
  Object.values(this.personasPorRolEstado).forEach((estados: any) => {
    (Object.values(estados) as Persona[][]).forEach((personas: Persona[]) => {
      personas.forEach(x => x.fecha && fechas.push(x.fecha.toString()));
    });
  });

  const minFecha = fechas.reduce((a, b) => a < b ? a : b, '') || '---';
  const maxFecha = fechas.reduce((a, b) => a > b ? a : b, '') || '---';

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    return `${d}/${m}/${y}`;
  };

  ws_data[rowIndex] = [];
  ws_data[rowIndex][0] = `Informe correspondiente al período del: ${formatFecha(minFecha)} al: ${formatFecha(maxFecha)}`;
  mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } });
  rowIndex++;

 
  mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } });
  rowIndex++;

  // Encabezados de tabla
  const headers = ['Nro', 'Cédula', 'Nombre', 'Contacto', 'Usuario', 'Dirección', 'Género', 'Fecha', 'Hora'];
  ws_data[rowIndex++] = headers;

  let contador = 1;

  // Cuerpo: roles, estados y datos
  Object.entries(this.personasPorRolEstado).forEach(([rolNombre, estados]: any) => {
    ws_data[rowIndex] = [`ROL: ${rolNombre.toUpperCase()}`];
    mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } });
    rowIndex++;

    Object.entries(estados).forEach(([estadoNombre, personas]: any) => {
      ws_data[rowIndex] = [`Estado: ${estadoNombre}`];
      mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } });
      rowIndex++;

      personas.forEach((xdat: any) => {
        const contacto = `${xdat.telefono || ''} ${xdat.correo || ''}`.trim() || 'Sin contacto';
        const genero = xdat.genero.nombre;

        ws_data[rowIndex] = [
          contador++,
          xdat.cedula,
          `${xdat.nombre || ''} ${xdat.ap_paterno || ''} ${xdat.ap_materno || ''}`.trim() || 'Sin nombre',
          contacto,
          xdat.credencial?.usuario || 'Sin usuario',
          xdat.direccion || 'Sin dirección',
          genero,
          xdat.fecha?.split('-').reverse().join('/') || '',
          xdat.hora || ''
        ];
        rowIndex++;
      });
    });
  });

  // Pie de página
  ws_data[rowIndex] = [];
  rowIndex++;
  ws_data[rowIndex] = [`Generado por: LUCIWEB, Norma Maizares, Fecha: ${fechaHora}`];
  mergeRanges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 8 } });

  // Crear hoja con merges y guardar
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ws_data);
  ws['!merges'] = mergeRanges;

  // Ajustar ancho de columnas
  ws['!cols'] = headers.map(() => ({ wch: 15 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `Reporte_personas_${fechaBoleta}.xlsx`);
}


exportarPDF() {
  const doc = new jsPDF();

  const fechaHora = new Date().toLocaleString();
  const fechaTexto = new Date().toLocaleDateString();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const filas: any[] = [];
  let contador = 1;

  // Guardamos las fechas para calcular rango
  const fechas: string[] = [];

  // Construir filas agrupadas por rol y estado (incluye filas de encabezado tipo colSpan)
  Object.keys(this.personasPorRolEstado).forEach((rolNombre) => {
    // fila de rol que ocupa toda la anchura (colSpan en la primera columna)
    filas.push({
      nro: { content: `ROL: ${rolNombre.toUpperCase()}`, colSpan: 9, styles: { halign: 'left', fillColor: [220, 220, 220], fontStyle: 'bold' } }
    });

    const estados = (this.personasPorRolEstado as any)[rolNombre];
    Object.keys(estados).forEach((estadoNombre) => {
      filas.push({
        nro: { content: `Estado: ${estadoNombre}`, colSpan: 9, styles: { halign: 'left', fontStyle: 'bold' } }
      });

      const personas = estados[estadoNombre] as any[];
      personas.forEach((xdat: any) => {
        filas.push({
          nro: contador++,
          cedula: xdat.cedula,
          nombre: `${xdat.nombre || ''} ${xdat.ap_paterno || ''} ${xdat.ap_materno || ''}`.trim() || 'Sin nombre',
          contacto: `${xdat.telefono || ''} ${xdat.correo || ''}`.trim() || 'Sin contacto',
          usuario: xdat.credencial?.usuario || 'Sin usuario',
          direccion: xdat.direccion || 'Sin dirección',
          genero: xdat.genero.nombre,
          fecha: xdat.fecha?.split('-').reverse().join('/') || '',
          hora: xdat.hora || ''
        });

        if (xdat.fecha) fechas.push(xdat.fecha.toString());
      });
    });
  });

  // Calcular fecha mínima y máxima
  const minFecha = fechas.length ? fechas.reduce((a, b) => a < b ? a : b) : '';
  const maxFecha = fechas.length ? fechas.reduce((a, b) => a > b ? a : b) : '';

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '';
    const [y, m, d] = fechaStr.split('-');
    if (!d || !m || !y) return fechaStr; // si no está en formato esperado, devolver como venga
    return `${d}/${m}/${y}`;
  };

  const minFechaFormatted = formatFecha(minFecha);
  const maxFechaFormatted = formatFecha(maxFecha);

  const columnas = [
    { header: 'Nro', dataKey: 'nro' },
    { header: 'Cédula', dataKey: 'cedula' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Contacto', dataKey: 'contacto' },
    { header: 'Usuario', dataKey: 'usuario' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Género', dataKey: 'genero' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Hora', dataKey: 'hora' }
  ];

  // Si no hay filas, generar un PDF con mensaje (más compacto)
  if (filas.length === 0) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.text('REPORTE DE PERSONAS', pageWidth / 2, 24, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text('No hay datos para mostrar en el reporte.', pageWidth / 2, 56, { align: 'center' });
    doc.save(`Reporte_personas_${fechaTexto.replace(/\//g, '-')}.pdf`);
    return;
  }

  autoTable(doc, {
    columns: columnas,
    body: filas,
    // Empezar la tabla más arriba para reducir espacio en blanco
    startY: 50,
    styles: { fontSize: 8 },
    theme: 'grid',
    didDrawPage: (data) => {
      // Encabezado compacto (título y línea más arriba)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text('REPORTE DE PERSONAS', pageWidth / 2, 24, { align: 'center' });

      doc.setFont('helvetica', 'italic'); doc.setFontSize(10);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(`Informe correspondiente al período del: ${minFechaFormatted || '---'}   al: ${maxFechaFormatted || '---'}`, 20, 32);

      // Línea decorativa colocada más arriba
      doc.setDrawColor(0); doc.setLineWidth(1.0);
      doc.line(23, 40, pageWidth - 23, 40);

      // Pie de página
      const footerY = pageHeight - 15;
      doc.setDrawColor(200); doc.setLineWidth(0.3);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text(`Página ${data.pageNumber}`, pageWidth - 5, pageHeight - 20, { align: 'right' });

      if (data.pageNumber === (doc as any).getNumberOfPages()) {
        const finalY = (data.cursor?.y ?? 100) + 8;
        doc.setFontSize(8);
        doc.setTextColor(70);
        doc.text(`Generado por: LUCIWEB, Norma Maizares, Fecha: ${fechaHora}`, 40, finalY);
      }
    }
  });

  doc.save(`Reporte_personas_${fechaTexto.replace(/\//g, '-')}.pdf`);
}



obtenerNombreRol(codigo: string): string {
  switch (codigo) {
    case '2': return 'Cliente';
    case '3': return 'Responsable Ventas';
    case '4': return 'Producción';
    case '5': return 'Proveedor';
    default: return 'Todos';
  }
}

obtenerNombreEstado(codigo: string): string {
  switch (codigo) {
    case '1': return 'Activo';
    case '0': return 'Bloqueado';
    default: return 'Todos';
  }
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