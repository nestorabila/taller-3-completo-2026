import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { NgFor } from '@angular/common'; // para *ngFor
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Credencial } from 'src/app/model/credencial';
import { Persona } from 'src/app/model/persona';
import { Rol } from 'src/app/model/rol';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { RolService } from 'src/app/servicio/rol.service';
import { NgChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { Negocio } from 'src/app/model/negocio';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { Categoria } from 'src/app/model/categoria';
import { DetalleInsumo } from 'src/app/model/detalle-insumo';
import { Empaque } from 'src/app/model/empaque';
import { Insumo } from 'src/app/model/insumo';
import { Producto } from 'src/app/model/producto';
import { Proveedor } from 'src/app/model/proveedor';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { DetalleInsumoService } from 'src/app/servicio/detalle-insumo.service';
import { EmpaqueService } from 'src/app/servicio/empaque.service';
import { InsumoService } from 'src/app/servicio/insumo.service';
import { ProductoService } from 'src/app/servicio/producto.service';
import { ProveedorService } from 'src/app/servicio/proveedor.service';
import { Catalogo } from 'src/app/model/catalogo';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Pedido } from 'src/app/model/pedido';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
@Component({
    selector: 'app-dashboard',
   imports: [NgxPaginationModule,  NgChartsModule,  CardModule, ChartModule,  ReactiveFormsModule, FormsModule, CommonModule],
   providers: [ConfirmationService],
   templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
 pag = 1; 
listaPersona: Persona[] = [];
  listaRol: Rol[]=[];
  listaCredencial: Credencial[]=[];
  listaLibreria: Negocio[]=[];
  listaProducto: Producto[]=[];
  listaCategoria: Categoria[]=[];
  listaProveedor: Proveedor[]=[];
  listaEmpaque: Empaque[]=[];
  listaCompra: Insumo[]=[];
  listaDetalleCompra: DetalleInsumo[]=[];
   listaCatalogo: Catalogo[]=[];
   listaPedido: Pedido[]=[];
   listaPedido1: Pedido[]=[];
   listaDetallePedido: DetallePedido[]=[];
  chart: any;
 constructor(private cataService: CatalogoService,  private PedidoService: PedidoService, private detPedidoService: DetallePedidoService,private prodService: ProductoService, private empaqueService: EmpaqueService, private compraService: InsumoService, private detcompraService: DetalleInsumoService,   private proveService: ProveedorService, private cateService: CategoriaService, private libreService: NegocioService,
    private PerService: PersonaService, private credeService: CredencialService,
     private rolService: RolService,  private httpClient: HttpClient, private formBuilder: FormBuilder) {
     }

  modelPersona() {
  this.PerService.ListarPersonas().subscribe((fall) => {
    this.listaPersona = fall.filter(p => !p.rol?.some(r => r.idrol === 1))

    .sort((a, b) => b.idpersona - a.idpersona);
    this.contarTotales();
    this.contarTotalesPorGenero();
    this.generarDatosLineaPorFecha();
  });
}

 modelRol() {
    this.rolService.ListarRol().subscribe((fall) => (this.listaRol = fall)) 
  }
  modelCredencial() {
    this.credeService.listarCredencial().subscribe((fall) => (this.listaCredencial = fall)) 
  }
modelLibreria() {
  this.libreService.ListarNegocioCompleto().subscribe((res) => {
    this.listaLibreria = res;
    this.totalLibrerias = res.length;

   this.nuevasLibrerias = res.filter(n =>
      this.esNuevo(n.fecha)
    ).length;

    

    this.desdeWeb = this.totalLibrerias - this.desdeMovil;

  });
}

modelCategoria() {
  this.cateService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria = fall.filter(cat => cat.estado===0)
    this.calcularTotalCategorias(); 
  });
}

modelProducto() {
  this.prodService.ListarProducto().subscribe((fall) => {
    this.listaProducto = fall;
    this.calcularTotalProductos(); // opcional si se necesita
  });
}

modelCompra() {
  this.compraService.ListarCompra().subscribe((fall) => {
    this.listaCompra = fall.sort((a, b) => b.idcompra! - a.idcompra!);
    this.calcularTotalCompras(); // idem
  });
}


   modelProveedor() {
      this.proveService.ListarProveedor().subscribe((fall) => (this.listaProveedor = fall))
    }
   modelEmpaque() {
    this.empaqueService.ListarEmpaque().subscribe((fall) => {
      this.listaEmpaque = fall;
    });
  }
 

    modelDetalleCompra() {
      this.detcompraService.ListarDetalleCompra().subscribe((fall) =>{
         this.listaDetalleCompra = fall;
         this.generarGraficoTopProductos();
         this.calcularTotales();

      })
    }

    modelCatalogo() {
  this.cataService.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall;
    this.sumacatalogos();
  });
}

    modelPedido() {
        this.PedidoService.ListarPedido().subscribe((fall) =>{
       
           this.listaPedido = fall;
          this.calcularTotalesPedidos();
          this.calcularTotales();
           this.generarDatosGraficoPedidos();
          this.aplicarFiltroTopClientes();
           this.generarGraficoEvolucionPedidos();
           this.generarGraficoSegimientoPedidos();
        })
      }

  
    
        modelDetallePedido() {
        this.detPedidoService.ListarDetallePedido().subscribe((fall) =>{
           this.listaDetallePedido = fall;
           this.generarGraficoSegimientoPedidos();
           this.aplicarFiltroTopCatalogos();
           this.generarGraficoEvolucionVentas(this.agrupacionVentas);

        })
      }
 
   ngOnInit(): void {
      this.modelPersona();
      this.contarTotales();
      this.modelRol();
      this.modelCredencial();
      this.filtrarClientesSinAcceso();
      this.modelLibreria();
      this.contarOrigenLibrerias();
      this.modelCompra();
      this.modelCatalogo();
      this.modelPedido();
      this.modelDetallePedido();
      this.modelCategoria();
      this.modelDetalleCompra();
      this.modelProducto();
      this.generarGraficoTopProductos();
    }

totalEgresos: number = 0;
totalIngresos: number = 0;
ganancia: number = 0;

calcularTotales() {
  this.totalEgresos = this.listaCompra.reduce((s, c) => s + Number(c.precio_total ?? 0), 0);
  this.totalIngresos = this.listaPedido.reduce((s, p) => s + Number(p.precio_total ?? 0), 0);
  this.ganancia = this.totalIngresos - this.totalEgresos;
    this.animarTotales(); 
}

totalEgresosAnimado = 0;
totalIngresosAnimado = 0;
gananciaAnimada = 0;

animarTotales() {
  const duracion = 900; // duración en ms
  const pasos = 50; // cuántos pasos de animación
  const intervalo = duracion / pasos;

  const animar = (final: number, setter: (v: number) => void) => {
    let i = 0;
    const incremento = final / pasos;
    const timer = setInterval(() => {
      i++;
      setter(Math.min(Math.round(incremento * i), final));
      if (i >= pasos) clearInterval(timer);
    }, intervalo);
  };

  animar(this.totalEgresos, v => this.totalEgresosAnimado = v);
  animar(this.totalIngresos, v => this.totalIngresosAnimado = v);
  animar(this.ganancia, v => this.gananciaAnimada = v);
}


graficoEvolucionVentasData: any = {};

    generarGraficoEvolucionVentas(agrupacion: 'dia' | 'semana' | 'mes' | 'anio' = 'mes') {
  const ventasPorPeriodo: { [periodo: string]: number } = {};

  for (const detalle of this.listaDetallePedido) {
    const pedido = detalle.pedido;
    if (pedido?.fecha) {
      const fecha = new Date(pedido.fecha);
      let clave = '';

      switch (agrupacion) {
        case 'dia':
          clave = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'semana': {
          const primerDia = new Date(fecha);
          primerDia.setDate(fecha.getDate() - fecha.getDay()); // inicio semana (domingo)
          clave = `Semana ${primerDia.toISOString().split('T')[0]}`;
          break;
        }
        case 'mes':
          clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`; // YYYY-MM
          break;
        case 'anio':
          clave = `${fecha.getFullYear()}`;
          break;
      }

      if (!ventasPorPeriodo[clave]) {
        ventasPorPeriodo[clave] = 0;
      }
      ventasPorPeriodo[clave] += Number(detalle.precio_subtotal) || 0;
    }
  }

  // Ordenar por fecha
  const ordenado = Object.entries(ventasPorPeriodo).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const labels = ordenado.map(([periodo]) => periodo);
  const datos = ordenado.map(([_, total]) => Math.round(total * 100) / 100);

  this.graficoEvolucionVentasData = {
    labels,
    datasets: [
      {
        label: 'Ventas (Bs.)',
        data: datos,
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.3
      }
    ]
  };
}

agrupacionVentas: 'dia' | 'semana' | 'mes' | 'anio' = 'mes';

cambiarAgrupacion(agrupacion: 'dia' | 'semana' | 'mes' | 'anio') {
  this.agrupacionVentas = agrupacion;
  this.generarGraficoEvolucionVentas(agrupacion);
}

graficoTopCatalogosData: any = {};

generarGraficoTopCatalogos(listaFiltrada: any[]) {
  const conteoCatalogos: { [nombre: string]: { cantidad: number, total: number } } = {};

  for (const detalle of listaFiltrada) {
    const catalogo = detalle.catalogo;
    if (catalogo) {
      const nombreCatalogo = catalogo.nombre.trim();
      const cantidad = Number(detalle.cantidad) || 0;
      const subtotal = Number(detalle.precio_subtotal) || 0;

      if (!conteoCatalogos[nombreCatalogo]) {
        conteoCatalogos[nombreCatalogo] = { cantidad: 0, total: 0 };
      }

      conteoCatalogos[nombreCatalogo].cantidad += cantidad;
      conteoCatalogos[nombreCatalogo].total += subtotal;
    }
  }

  const catalogosOrdenados = Object.entries(conteoCatalogos)
    .sort((a, b) => b[1].cantidad - a[1].cantidad)
    .slice(0, 5);

  const labels = catalogosOrdenados.map(([nombre]) => nombre);
  const datosCantidad = catalogosOrdenados.map(([_, datos]) => datos.cantidad);
  const datosTotales = catalogosOrdenados.map(([_, datos]) =>
    Math.round(Number(datos.total) * 100) / 100
  );

  this.graficoTopCatalogosData = {
    labels,
    datasets: [
      {
        label: 'Cantidad vendida',
        data: datosCantidad,
        backgroundColor: '#fbbf24'
      },
      {
        label: 'Total en Bs.',
        data: datosTotales,
        backgroundColor: '#34d399'
      }
    ]
  };
}

aplicarFiltroTopCatalogos() {
  const fechaActual = new Date();

  const filtrado = this.listaDetallePedido.filter(det => {
    // Obtener la fecha desde el pedido relacionado
    const fechaPedido = det.pedido?.fecha ? new Date(det.pedido.fecha) : null;
    if (!fechaPedido) return false;

    switch (this.filtroTiempo) {

      case 'dia':
        return fechaPedido.toDateString() === fechaActual.toDateString();

      case 'semana':
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
        return fechaPedido >= inicioSemana && fechaPedido <= fechaActual;

      case 'mes':
        return (
          fechaPedido.getMonth() === fechaActual.getMonth() &&
          fechaPedido.getFullYear() === fechaActual.getFullYear()
        );

      case 'anio':
        return fechaPedido.getFullYear() === fechaActual.getFullYear();
    }

    return true;
  });

  this.generarGraficoTopCatalogos(filtrado);
}

filtroTiempo: string = 'mes'; // valor por defecto




GraficoSeguimiento: any;
opcionesGraficoSeguimiento1: any;

generarGraficoSegimientoPedidos() {
  const data: number[] = [];
  const labels: string[] = [];
  const backgroundColors: string[] = [];

  const hoy = new Date();

  this.listaPedido
    .filter(pedido => [1, 2, 3].includes(pedido.estado))
    .forEach(pedido => {
      const detallesDelPedido = this.listaDetallePedido.filter(dp => dp.idpedido === pedido.idpedido);
      const totalDetalles = detallesDelPedido.length;
      const detallesTerminados = detallesDelPedido.filter(dp => dp.estado === 1).length;

      let avance = 0;
      if (pedido.estado === 1) {
        avance = 0;
      } else if (pedido.estado === 2) {
        avance = totalDetalles > 0 ? Math.round((detallesTerminados / totalDetalles) * 100) : 0;
      } else if (pedido.estado === 3) {
        avance = 100;
      }

      // Cálculo del tiempo restante o retraso
      let tiempoRestanteTexto = '';
      if (pedido.fecha_entrega) {
        const fechaEntrega = new Date(pedido.fecha_entrega);
        const diferenciaEnMs = fechaEntrega.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diferenciaEnMs / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
          tiempoRestanteTexto = ` - ⚠️ Retrasado ${Math.abs(diasRestantes)} día(s)`;
        } else {
          tiempoRestanteTexto = ` - 🕒 ${diasRestantes} día(s) restantes`;
        }
      } else {
        tiempoRestanteTexto = ` - 📅 Sin fecha de entrega`;
      }

      const nombreCliente = `${pedido.libreria?.persona?.nombre ?? ''} ${pedido.libreria?.persona?.ap_paterno ?? ''}`;
      const razon = pedido.libreria?.razon_social ?? 'Negocio';
      labels.push(`${razon} - ${nombreCliente}${tiempoRestanteTexto}`);

      data.push(avance);

      if (avance <= 10) {
        backgroundColors.push('#EF4444'); // Rojo
      } else if (avance < 90) {
        backgroundColors.push('#FACC15'); // Amarillo
      } else {
        backgroundColors.push('#22C55E'); // Verde
      }
    });

  this.GraficoSeguimiento = {
    labels: labels,
    datasets: [
      {
        label: 'Avance de Pedidos (%)',
        data: data,
        backgroundColor: backgroundColors,
        borderRadius: 6,
      },
    ],
  };

  this.opcionesGraficoSeguimiento1 = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: number) => value + '%'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const valor = context.parsed.x;
            if (valor === 0) {
              return 'Aún no se inició este pedido';
            } else {
              return `${valor}% completado`;
            }
          }
        }
      }
    }
  };
}



    totalCatalogo: number = 0;
    CatalogoActivo: number = 0;
    CatalogoInactivo: number = 0;
    CatalogoDestacado: number = 0;
    CatalogoNoDestacado: number = 0;

    sumacatalogos(){
      this.CatalogoActivo = this.listaCatalogo.filter(c => c.estado===1).length;
      this.CatalogoInactivo= this.listaCatalogo.filter(c=>c.estado===0).length;
      this.CatalogoDestacado= this.listaCatalogo.filter(c => c.destacado===1).length;
      this.CatalogoNoDestacado= this.listaCatalogo.filter(c => c.destacado===0).length;
      this.totalCatalogo= this.CatalogoActivo + this.CatalogoInactivo + this.CatalogoDestacado + this.CatalogoNoDestacado;
    }

totalCancelados: number = 0;
totalPendientes: number = 0;
totalEnProceso: number = 0;
totalCompletados: number = 0;
totalEntregados: number = 0;
totalPedidos: number = 0;

calcularTotalesPedidos() {
  this.totalCancelados = this.listaPedido.filter(p => p.estado === 0).length;
  this.totalPendientes = this.listaPedido.filter(p => p.estado === 1).length;
  this.totalEnProceso = this.listaPedido.filter(p => p.estado === 2).length;
  this.totalCompletados = this.listaPedido.filter(p => p.estado === 3).length;
  this.totalEntregados = this.listaPedido.filter(p => p.estado === 4).length;
  this.totalPedidos = this.totalCancelados + this.totalPendientes + this.totalEnProceso + this.totalCompletados + this.totalEntregados;
}

filtroPeriodo: string = 'mes';

 graficoPedidosEvolucionData: any = {};

generarGraficoEvolucionPedidos(agrupacion: string = 'mes') {
 
  if (!['dia', 'semana', 'mes', 'anio'].includes(agrupacion)) {
    agrupacion = 'mes';
  }
  const agrupacionLiteral = agrupacion as 'dia' | 'semana' | 'mes' | 'anio';

  const pedidos = this.listaPedido;
  const agrupados: { [clave: string]: number } = {};

  for (const pedido of pedidos) {
    const fecha = new Date(pedido.fecha);
    let clave = '';

   if (agrupacionLiteral === 'dia') {
  clave = fecha.toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }); // Ej: 10 de octubre de 2025
}

    
    else if (agrupacionLiteral === 'semana') {
      const primeraFechaDelAño = new Date(fecha.getFullYear(), 0, 1);
      const diasPasados = Math.floor((fecha.getTime() - primeraFechaDelAño.getTime()) / (1000 * 60 * 60 * 24));
      const semana = Math.ceil((diasPasados + primeraFechaDelAño.getDay() + 1) / 7);
      clave = `Semana ${semana} - ${fecha.getFullYear()}`;
    } else if (agrupacionLiteral === 'mes') {
      clave = fecha.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });
    } else if (agrupacionLiteral === 'anio') {
      clave = fecha.getFullYear().toString();
    }

    if (!agrupados[clave]) {
      agrupados[clave] = 0;
    }

    agrupados[clave]++;
  }

  const clavesOrdenadas = Object.keys(agrupados).sort((a, b) => {
    const fechaA = this.convertirClaveAFecha(a, agrupacionLiteral);
    const fechaB = this.convertirClaveAFecha(b, agrupacionLiteral);
    return fechaA.getTime() - fechaB.getTime();
  });

  const cantidades = clavesOrdenadas.map(clave => agrupados[clave]);

  this.graficoPedidosEvolucionData = {
    labels: clavesOrdenadas,
    datasets: [
      {
        label: `Pedidos por ${agrupacionLiteral}`,
        data: cantidades,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        fill: true,
        tension: 0.3
      }
    ]
  };
}

convertirClaveAFecha(clave: string, tipo: 'dia' | 'semana' | 'mes' | 'anio'): Date {
  if (tipo === 'dia') {
    const partes = clave.split('/');
    return new Date(+partes[2], +partes[1] - 1, +partes[0]);
  } else if (tipo === 'semana') {
    const match = clave.match(/Semana (\d+) - (\d+)/);
    const semana = Number(match?.[1]);
    const anio = Number(match?.[2]);
    const primerDiaAnio = new Date(anio, 0, 1);
    const fecha = new Date(primerDiaAnio.setDate(primerDiaAnio.getDate() + (semana - 1) * 7));
    return fecha;
  } else if (tipo === 'mes') {
    return new Date(clave);
  } else if (tipo === 'anio') {
    return new Date(+clave, 0, 1);
  }
  return new Date();
}

graficoTopClientesData: any = {};

generarGraficoTopClientes(listaFiltrada: any[]) {
  const conteoClientes: { [nombre: string]: { cantidad: number, total: number } } = {};

  for (const pedido of listaFiltrada) {
    const cliente = pedido.negocio?.persona;
    const precioTotal = Number(pedido.precio_total) || 0;

    if (cliente) {
      const nombreCompleto = `${cliente.nombre.trim()} ${cliente.ap_paterno.trim()}`;

      if (!conteoClientes[nombreCompleto]) {
        conteoClientes[nombreCompleto] = { cantidad: 0, total: 0 };
      }

      conteoClientes[nombreCompleto].cantidad++;
      conteoClientes[nombreCompleto].total += precioTotal;
    }
  }

  const clientesOrdenados = Object.entries(conteoClientes)
    .sort((a, b) => b[1].cantidad - a[1].cantidad)
    .slice(0, 5);

  const labels = clientesOrdenados.map(([nombre]) => nombre);
  const datosCantidad = clientesOrdenados.map(([_, datos]) => datos.cantidad);
  const datosTotales = clientesOrdenados.map(([_, datos]) =>
    Math.round(Number(datos.total) * 100) / 100
  );

  this.graficoTopClientesData = {
    labels,
    datasets: [
      {
        label: 'Cantidad de pedidos',
        data: datosCantidad,
        backgroundColor: '#4ade80'
      },
      {
        label: 'Total en Bs.',
        data: datosTotales,
        backgroundColor: '#60a5fa'
      }
    ]
  };
}
filtroTiempoClientes: string = 'mes';

aplicarFiltroTopClientes() {
  const fechaActual = new Date();

  const filtrado = this.listaPedido.filter(ped => {
    const fechaPedido = ped.fecha ? new Date(ped.fecha) : null;
    if (!fechaPedido) return false;

    switch (this.filtroTiempoClientes) {

      case 'dia':
        return fechaPedido.toDateString() === fechaActual.toDateString();

      case 'semana':
        const inicioSemana = new Date(fechaActual);
        inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
        return fechaPedido >= inicioSemana && fechaPedido <= fechaActual;

      case 'mes':
        return (
          fechaPedido.getMonth() === fechaActual.getMonth() &&
          fechaPedido.getFullYear() === fechaActual.getFullYear()
        );

      case 'anio':
        return fechaPedido.getFullYear() === fechaActual.getFullYear();
    }

    return true;
  });

  // Enviar filtrado a copiar de tu función original
  this.generarGraficoTopClientes(filtrado);
}

graficoPedidosData: any;

generarDatosGraficoPedidos() {
  let totalMovil = 0;
  let totalWeb = 0;

  for (const pedido of this.listaPedido) {
    const nombreCompletoNegocio = pedido.libreria?.persona?.nombre?.trim().toLowerCase() + ' ' +
                                   pedido.libreria?.persona?.ap_paterno?.trim().toLowerCase();

    const registradoPor = pedido.persona?.nombre.trim().toLowerCase();

    if (registradoPor === nombreCompletoNegocio) {
      totalMovil++;
    } else {
      totalWeb++;
    }
  }

  const total = totalMovil + totalWeb;
  const porcentajeMovil = total > 0 ? +(totalMovil * 100 / total).toFixed(2) : 0;
  const porcentajeWeb = total > 0 ? +(totalWeb * 100 / total).toFixed(2) : 0;

  this.graficoPedidosData = {
  labels: [
    `App (${porcentajeMovil}%)`,
    `Web (${porcentajeWeb}%)`
  ],
  datasets: [{
    data: [porcentajeMovil, porcentajeWeb],
    backgroundColor: ['#4ade80', '#60a5fa'],
    hoverOffset: 10
  }],
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: () => '' // Oculta completamente el valor duplicado
        }
      },
      legend: {
        labels: {
          font: {
            size: 14
          }
        }
      }
    }
  }
};

}





    calcularTotalCategorias() {
  this.totalCategorias = this.listaCategoria.length;
}

calcularTotalProductos() {
  this.totalProductos = this.listaProducto.length;
}

calcularTotalCompras() {
  this.totalCompras = this.listaCompra.length;
}

totalCategorias: number = 0;
totalProductos: number = 0;
totalCompras: number = 0;

topProducto: { nombre: string; cantidad: number; total: number } | null = null;
barChartData: ChartData<'bar'> | null = null;
barChartOptions: ChartOptions<'bar'> = {}; // Se llena después

generarGraficoTopProductos() {
  const conteoProductos: { [nombre: string]: number } = {};
  const totalPorProducto: { [nombre: string]: number } = {};

  this.listaDetalleCompra.forEach((detalle) => {
    const nombreProducto = detalle.producto?.nombre;
    const cantidad = detalle.cantidad_e || 0;
    const precio = detalle.precio_u || 0;

    if (nombreProducto) {
      conteoProductos[nombreProducto] = (conteoProductos[nombreProducto] || 0) + cantidad;
      totalPorProducto[nombreProducto] = (totalPorProducto[nombreProducto] || 0) + cantidad * precio;
    }
  });

  const topProductos = Object.entries(conteoProductos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const nombres = topProductos.map(p => p[0]);
  const cantidades = topProductos.map(p => p[1]);

  if (topProductos.length > 0) {
    const [nombreTop, cantidadTop] = topProductos[0];
    this.topProducto = {
      nombre: nombreTop,
      cantidad: cantidadTop,
      total: +(totalPorProducto[nombreTop] || 0).toFixed(2),
    };
  }

  // Actualizar gráfico
  this.barChartData = {
    labels: nombres,
    datasets: [
      {
        label: 'Cantidad comprada',
        data: cantidades,
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15', '#f87171', '#a78bfa'],
        borderWidth: 1,
      },
    ],
  };

  this.barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 insumos más comprados',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (ctx: any) {
            return `Cantidad: ${ctx.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        ticks: {
          precision: 0,
        },
      },
    },
  };
}




totalLibreriasMovil: number = 0;
totalLibreriasWeb: number = 0;

public libreriaChartData: any;
public libreriaChartType: any = 'pie';

public libreriaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        boxWidth: 22,
        font: {
          size: 14,
          family: 'sans-serif'
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = Number(context.raw);
          const total = context.chart._metasets[0].total;
          const porcentaje = ((value / total) * 100).toFixed(1);
          return `${label}: ${porcentaje}%`;
        }
      }
    }
  }
};
contarOrigenLibrerias() {
  this.libreService.ListarNegocioCompleto().subscribe((res) => {
    const total = res.length;

    this.totalLibreriasWeb = total - this.totalLibreriasMovil;

    // Cargar los datos en el gráfico
    this.libreriaChartData = {
      labels: ['Desde Móvil', 'Desde Web'],
      datasets: [
        {
          data: [this.totalLibreriasMovil, this.totalLibreriasWeb],
          backgroundColor: ['#4ade80', '#60a5fa'],
        }
      ]
    };
  });
}
    clientesSinAcceso: Persona[] = [];
filtrarClientesSinAcceso() {
  this.PerService.ListarPersonas().subscribe(personas => {
    this.clientesSinAcceso = personas.filter(p =>
    p.rol?.some(r => r.idrol === 2) && !p.credencial

    );
  });
}

    datosGraficoLinea: any;

generarDatosLineaPorFecha() {
  const conteo: { [fecha: string]: number } = {};

  this.listaPersona.forEach(p => {
    const fecha = new Date(p.fecha).toISOString().split('T')[0]; 
    conteo[fecha] = (conteo[fecha] || 0) + 1;
  });

  const fechas = Object.keys(conteo).sort(); 
  const cantidades = fechas.map(f => conteo[f]);

  this.datosGraficoLinea = {
    labels: fechas,
    datasets: [
      {
        label: 'Evolucion registro personas',
        data: cantidades,
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.3
      }
    ]
  };
}

    totalFemenino: number = 0;
totalMasculino: number = 0;

contarTotalesPorGenero() {
  this.totalFemenino = this.listaPersona.filter(p => p.genero?.idgenero === 2).length;
  this.totalMasculino = this.listaPersona.filter(p => p.genero?.idgenero === 1).length;

  // Actualizar los datos del gráfico
  this.pieChartData = {
    labels: ['Femenino', 'Masculino'],
    datasets: [
      {
        data: [this.totalFemenino, this.totalMasculino],
        backgroundColor: ['#ec4899', '#3b82f6'], // rosa y azul
      }
    ]
  };
}

public pieChartData: any;
public pieChartType: any = 'pie';
public pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false, 
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        boxWidth: 22,
        font: {
          size: 14,
          family: 'sans-serif'
        }
      }
    }
  }
};




totalLibrerias: number = 0;
desdeMovil: number = 0;
desdeWeb: number = 0;
nuevasLibrerias: number = 0;

// persona
  totalPersonas: number = 0;
nuevosRegistros: number = 0;
totalClientes: number = 0;
totalProveedores: number = 0;
totalPersonal: number = 0;
totalActivos: number = 0;
totalBloqueados: number = 0;
esNuevo(fecha: Date): boolean {
  const ahora = new Date();
  const fechaPersona = new Date(fecha);

  const milisegundosEnTresDias = 3 * 24 * 60 * 60 * 1000;

  // Si la fecha del registro está entre ahora y hace 3 días
  return (ahora.getTime() - fechaPersona.getTime()) <= milisegundosEnTresDias;
}
contarTotales() {
  this.PerService.ListarPersonas().subscribe((personas) => {
    const lista = personas.filter(p => p.rol?.some(a=> a.idrol !== 1)); // filtra fuera el admin

    this.totalPersonas = lista.length;
    this.nuevosRegistros = lista.filter(p => this.esNuevo(p.fecha)).length;
   this.totalClientes = lista.filter(p => p.rol?.some(r => r.idrol === 2)).length;

this.totalProveedores = lista.filter(p => p.rol?.some(r => r.idrol === 5)).length;

this.totalPersonal = lista.filter(p => p.rol?.some(r => r.idrol === 3 || r.idrol === 4)).length;

    this.totalActivos = lista.filter(p => p.estado === 1).length;
    this.totalBloqueados = lista.filter(p => p.estado === 0).length;
  });
}















panelActivo: string = 'principal'; 
  seleccionarPanel(panel: string) {
    this.panelActivo = panel;
  }
}