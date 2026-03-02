import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { Catalogo } from 'src/app/model/catalogo';
import { Persona } from 'src/app/model/persona';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { PersonaService } from 'src/app/servicio/persona.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Negocio } from 'src/app/model/negocio';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { DropdownModule } from 'primeng/dropdown';

import { RadioButtonModule } from 'primeng/radiobutton';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { Pedido } from 'src/app/model/pedido';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@Component({
  selector: 'app-regipedidos',
     imports: [DropdownModule, ProgressSpinnerModule, InputSwitchModule,RadioButtonModule, NgxPaginationModule, SplitterModule, FieldsetModule,AvatarModule, MenuModule, ToastModule, Dialog, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
        providers: [ConfirmationService, MessageService],
  templateUrl: './regipedidos.component.html',
  styleUrl: './regipedidos.component.css'
})
export class RegipedidosComponent {
puedeGuardar: boolean = true; // por defecto activo

validarFechaEntrega() {
  if (!this.fecha_entrega) return;

  // normalizamos la fecha seleccionada (solo YYYY-MM-DD, en zona local)
  const normalize = (d: string | Date) => {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fechaSeleccionadaNorm = normalize(this.fecha_entrega);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaSeleccionada = new Date(this.fecha_entrega);
  fechaSeleccionada.setHours(0, 0, 0, 0);

  // validar fecha pasada
  if (fechaSeleccionada < hoy) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Fecha inválida',
      detail: 'No se puede seleccionar una fecha anterior'
    });
    this.fecha_entrega = '';
    this.puedeGuardar = false;
    return;
  }

 

  // contar pedidos que ya tienen esa fecha (normalizando)
  const pedidosMismaFecha = this.listaPedido.filter(pedido => {
    if (!pedido?.fecha_entrega) return false;
    return normalize(pedido.fecha_entrega) === fechaSeleccionadaNorm;
  });

  const cantidad = pedidosMismaFecha.length;

  if (cantidad >= 2) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Fecha no disponible',
      detail: `Seleccione otra fecha, ya existen ${cantidad} pedidos para esta fecha`
    });
    this.fecha_entrega = '';
    this.puedeGuardar = false;
    return;
  }

  // todo ok
  this.puedeGuardar = true;
}



validarCliente() {
  if (!this.proveedorSeleccionado) {
    this.puedeGuardar = false; // no hay cliente
    return;
  }

  const negocioId = (this.proveedorSeleccionado as Negocio).idlibreria; 
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  const tienePedido = this.listaPedido.some(pedido => {
    if (!pedido.libreria) return false;

    const fechaInicio = new Date(pedido.fecha);
    const fechaFin = pedido.fecha_entrega ? new Date(pedido.fecha_entrega) : fechaInicio;
    fechaInicio.setHours(0,0,0,0);
    fechaFin.setHours(0,0,0,0);

    return pedido.libreria.idlibreria === negocioId && hoy >= fechaInicio && hoy <= fechaFin;
  });

  if (tienePedido) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Cliente con pedido activo',
      detail: 'El cliente ya tiene un pedido registrado actualmente'
    });

    this.proveedorSeleccionado = undefined!;
    this.puedeGuardar = false; // deshabilitar botón
  } else {
    this.puedeGuardar = true; // habilitar si no tiene pedido
  }
}



  mostrarContenido: boolean = false;
  mostrarContenido1: boolean = true;
  togglePanel1() {
  this.mostrarContenido = !this.mostrarContenido;
  if (this.mostrarContenido) {
    this.mostrarContenido1 = false;
  }
}


togglePanel2() {
  this.mostrarContenido1 = !this.mostrarContenido1;
  if (this.mostrarContenido1) {
    this.mostrarContenido = false;
  }
}


listaCatalogo: Catalogo[]=[];
listaPedido: Pedido[]=[];
listaNegocio: Negocio[]=[];
   constructor(private pedidoService: PedidoService, private detpedidoService: DetallePedidoService, private negoService: NegocioService, private serviceCatalogo: CatalogoService, private confirmationService: ConfirmationService, private messageService: MessageService) {}
    

   modelPedido() {
  this.pedidoService.ListarPedido().subscribe((fall) => {
    this.listaPedido = fall;
  });
}

 visible: boolean = false;
  
  modelCliente() {
  this.negoService.ListarNegocioCompleto().subscribe((fall) => {
    this.listaNegocio = fall.filter(p => p.persona?.estado== 1 && p.estado==1)
    .sort((a, b) => b.idlibreria - a.idlibreria);
  });
}
loading: boolean = false;
modelCatalogo() {
  this.loading = true;
  this.serviceCatalogo.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall.sort((a, b) => b.idcatalogo - a.idcatalogo);
    this.loading = false
  });
}
  filtro: string = ''; 
  buscarCatalogo() {
  if (this.filtro.trim()) {
    this.serviceCatalogo.buscarCatalogo(this.filtro).subscribe((result) => {
      this.listaCatalogo = result;
    });
  } else {
    this.modelCatalogo(); 
  }
}

modalImagenVisible: boolean = false;
imagenSeleccionadaModal: string = '';

verImagen(nombreImagen: string) {
  this.imagenSeleccionadaModal = nombreImagen;
  this.modalImagenVisible = true;
}
adjustCantidad(index: number, operacion: 'sumar' | 'restar'): void {
  const actual = this.detalleCompraData[index].cantidad || 0;
  if (operacion === 'sumar') {
    this.detalleCompraData[index].cantidad = actual + 6;
  } else {
    this.detalleCompraData[index].cantidad = Math.max(6, actual - 6);
  }
}

ngOnInit(): void {
  const token = localStorage.getItem('token');
   this.modelCatalogo();
   this.modelCliente();
   this.modelPedido();
}
 productosSeleccionados: Catalogo[] = [];
idsProductosSeleccionados: number[] = []; 
detalleCompraData: any[] = [];
 toggleProductoSeleccionado(event: Event, producto: Catalogo): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    // Agregar ID del producto seleccionado
    this.idsProductosSeleccionados.push(producto.idcatalogo);
    
    // Agregar producto al arreglo de productos seleccionados
    this.productosSeleccionados.push(producto);

    // Agregar entrada vacía para los datos de detalle de compra
    this.detalleCompraData.push({
      cantidad: 6,
      catalogo: producto,
    });
  } else {
    // Quitar ID del producto
    this.idsProductosSeleccionados = this.idsProductosSeleccionados.filter(id => id !== producto.idcatalogo);

    // Encontrar el índice del producto en productosSeleccionados
    const index = this.productosSeleccionados.findIndex(p => p.idcatalogo === producto.idcatalogo);

    // Eliminar tanto de productosSeleccionados como de detalleCompraData
    if (index !== -1) {
      this.productosSeleccionados.splice(index, 1);
      this.detalleCompraData.splice(index, 1);
    }
  }
}

// registrar pedido
// proveedorSeleccionado!: Negocio;
proveedorSeleccionado = undefined!;
fecha_entrega: string | null = null;

verificarYRegistrar() {
  if (!this.proveedorSeleccionado) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Debe seleccionar un cliente',
      detail: 'Seleccione un cliente antes de guardar el pedido',
      life: 3000
    });
    return;
  }
  this.registrarTodo();
}

registrarTodo() {
   this.loadingSave = true;
   const idpersona = Number(localStorage.getItem('idpersona'));
  const fecha = new Date();
  const hora = fecha.toTimeString().split(' ')[0];
const fecha_entrega = this.fecha_entrega?.trim()
  ? new Date(this.fecha_entrega + 'T00:00:00')
  : null;

  // Paso 1: Datos del pedido principal
  const compraData = {
    fecha: fecha,
    fecha_entrega: fecha_entrega,
    hora: hora,
    idpersona,
    estado: 1,
    libreria: this.proveedorSeleccionado
  };


  this.pedidoService.RegistrarPedido(compraData).subscribe((compraCreada: any) => {
    const idCompra = compraCreada.idpedido;

    // Objeto completo que cumple con la interfaz Pedido
    const compraCompleta = {
      idpedido: idCompra,
      fecha: compraData.fecha,
      hora: compraData.hora,
      fecha_entrega: compraData.fecha_entrega,
      idpersona: compraData.idpersona,
      estado: compraData.estado,
      libreria: compraData.libreria
    };

    // Paso 2: Crear lista de detalles correctamente
    const detalles = this.detalleCompraData.map(det => {
      const cantidad = parseInt(det.cantidad); // Asegura que sea número
      const precioUnitario = det.catalogo?.precio || 0;
      const precio_subtotal = cantidad * precioUnitario;

      return {
        cantidad: cantidad,
        estado:0,
        precio_subtotal: precio_subtotal,
        catalogo: det.catalogo,
        pedido: compraCompleta
      };
    });


    // Paso 3: Enviar cada detalle
    let registrados = 0;
    for (let detalle of detalles) {
      this.detpedidoService.RegistrarDetallePedido(detalle).subscribe(() => {
        registrados++;
        if (registrados === detalles.length) {
          this.messageService.add({
            severity: 'success',
            summary: 'Pedido Registrada',
            detail: 'Nuevo pedido registrado correctamente'
          });
          this.limpiarTodo();
           this.loadingSave = false;
          this.modelPedido();
        }
      });
    }
  });
}
loadingSave = false;


limpiarTodo() {
  this.proveedorSeleccionado = null!;
  this.productosSeleccionados = [];
  this.idsProductosSeleccionados = [];
  this.detalleCompraData = [];
   this.fecha_entrega = '';
}
}
