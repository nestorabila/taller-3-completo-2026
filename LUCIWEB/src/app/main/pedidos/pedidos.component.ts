import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Categoria } from 'src/app/model/categoria';
import { DropdownModule } from 'primeng/dropdown';
import { CategoriaService } from 'src/app/servicio/categoria.service';

import { SplitButton } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { NgxPaginationModule } from 'ngx-pagination';
import { Catalogo } from 'src/app/model/catalogo';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Negocio } from 'src/app/model/negocio';
import { Pedido } from 'src/app/model/pedido';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { PedidoService } from 'src/app/servicio/pedido.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-pedidos',
  imports: [DropdownModule, ProgressSpinnerModule, Dialog, NgxPaginationModule, SplitterModule, InputSwitchModule, FieldsetModule,AvatarModule,ConfirmDialog , MenuModule, ToastModule, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
   providers: [ConfirmationService, MessageService],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent  {
  vistaDetalleActiva: boolean = false;
pedidoSeleccionado: any = null;

verDetalleSeparado(pedido: any) {
  this.vistaDetalleActiva = true;
  this.pedidoSeleccionado = pedido;

  // 👇 Cargar los detalles del pedido
  if (pedido?.idpedido) {
    this.detPedidoService.ListarDetallePedidoID(pedido.idpedido).subscribe((resp) => {
      this.listaDetallePedido = resp;
     
    }, error => {
      console.error("Error al cargar detalles del pedido", error);
    });
  }
}


cerrarDetalle() {
  this.vistaDetalleActiva = false;
  this.pedidoSeleccionado = null;
  this.modelPedido();
}

  pag= 1;
    mostrarDetalle = false;
    toggleDetalle() {
      this.mostrarDetalle = !this.mostrarDetalle;
    }
  
  
    ObtenerCategoria!: Categoria;
    
      listaCatalogo: Catalogo[]=[];
      listaNegocio: Negocio[]=[];
      listaPedido: Pedido[]=[];
      listaDetallePedido: DetallePedido[]=[];
    
        pedidoForm: any = new FormGroup({
            idpedido: new FormControl(''),
            fecha: new FormControl(''),
            fecha_entrega: new FormControl(''),
            hora:  new FormControl(''),
            libreria: new FormControl(''),
          })

           detpedidoForm: any = new FormGroup({
            iddetalle_pedido: new FormControl(''),
            cantidad: new FormControl(6),
            pedido:  new FormControl(''),
            estado:  new FormControl(''),
            catalogo: new FormControl('', Validators.required),
          })
         
    
    constructor(private cataService: CatalogoService, private negocioService: NegocioService, private NegocioService: NegocioService, private PedidoService: PedidoService, private detPedidoService: DetallePedidoService,   private proveService: CatalogoService, private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService) {
   
    }
 catalogoYaUsado(): boolean {
  const personaSel = this.detpedidoForm.get('catalogo')?.value;
  if (!personaSel) return false;

  return this.listaDetallePedido.some(
    (p) => p.catalogo?.idcatalogo === personaSel.idcatalogo
  );
}
  fechaMayor(): boolean {
  const fechaRegistro = this.pedidoForm.get('fecha')?.value;
  const fechaEntrega = this.pedidoForm.get('fecha_entrega')?.value;

  if (!fechaRegistro || !fechaEntrega) return false;
  const fRegistro = new Date(fechaRegistro);
  const fEntrega = new Date(fechaEntrega);
  return fEntrega <= fRegistro;
}

    modelCliente() {
  this.negocioService.ListarNegocioCompleto().subscribe((fall) => {
    this.listaNegocio = fall.filter(p => p.persona?.estado== 1)
    .sort((a, b) => b.idlibreria - a.idlibreria);
  });
}

modelCatalogo() {
  this.cataService.ListarCatalogo().subscribe((fall) => {
    this.listaCatalogo = fall.sort((a, b) => b.idcatalogo - a.idcatalogo);
  });
}

loading: boolean = false;
    modelPedido() {
      this.loading=true
        this.PedidoService.ListarPedido().subscribe((fall) =>{
           this.listaPedido = fall.sort((a, b) => b.idpedido! - a.idpedido!);
           this.loading=false
        })
      }
  
        ObtenerPedido!: Pedido;
     modelDetallePedidoID() {
    if (this.ObtenerPedido) {
      this.detPedidoService.ListarDetallePedidoID(this.ObtenerPedido.idpedido!).subscribe((fall) => {
        this.listaDetallePedido= fall;
        
        
      });
    } else {
      console.warn('No hay para cargar');
    }
     }
  detalleVisibleId: number | null = null;
  totalesPorPedido: { [key: number]: number } = {};
verDetallePedido(idPedido: number) {
  this.detalleVisibleId = idPedido;
  this.detPedidoService.ListarDetallePedidoID(idPedido).subscribe((resp) => {
    this.listaDetallePedido = resp;
    const total = resp.reduce((acc, item) => acc + (item.precio_subtotal || 0), 0);
    this.totalesPorPedido[idPedido] = total;
  }, error => {
    
  });
}


  getTotal(idPedido: number | undefined): number | null {
    if (idPedido === undefined) return null;
    return this.totalesPorPedido[idPedido] ?? null;
  }
  
      ngOnInit(): void {
      this.modelCatalogo();
      this.modelPedido();
      
      this.modelCatalogo();
      this.modelCliente();
      this.modelDetallePedidoID();
      }
    // llama de aqui al metod buscar 
 filtrarPedidos(filtro: string) {
  this.PedidoService.ListarPedidosFiltradas(filtro).subscribe(
    (data) => {
      this.listaPedido = data.sort((a, b) => b.idpedido! - a.idpedido!);
    },
    (error) => {
      console.error("Error al filtrar personas:", error);
    }
  );
}
adjustCantidadForm(accion: 'sumar' | 'restar') {
  const control = this.detpedidoForm.get('cantidad');
  if (!control) return;

  let valor = control.value || 6;

  if (accion === 'sumar') {
    valor += 6;
  } else if (accion === 'restar') {
    valor = Math.max(6, valor - 6);
  }

  control.setValue(valor);
}

  filtro: string = ''; 
  buscarPedido() {
  if (this.filtro.trim()) {
    this.PedidoService.buscarPedidos(this.filtro).subscribe((result) => {
      this.listaPedido = result;
    });
  } else {
    this.modelPedido(); 
  }
}
    
    // añadir mas Pedidos
     xper!: any;
    // añadir mas detales Pedidos
    xper1!: any;
    registrarDetallePedido() {
      
  const Seleccionado = this.detpedidoForm.get('catalogo')?.value as Catalogo;
  const cantidadSeleccionada = this.detpedidoForm.get('cantidad')?.value;
  this.xper1 = {
    cantidad: cantidadSeleccionada,
    precio_subtotal: cantidadSeleccionada * Seleccionado.precio,
    catalogo: Seleccionado,
    pedido: this.PedidoSeleccionada,
  };
      
       
        this.detPedidoService
          .RegistrarDetallePedido(this.xper1)
          .subscribe(() => {
            this.detPedidoService.ListarDetallePedidoID(this.ObtenerPedido.idpedido!).subscribe((fall) => (this.listaDetallePedido = fall))
            
            this.detpedidoForm.reset();
          });
      }
    
     // modificar Pedido
  vistaPedido(xdat: Pedido) {  
    const Seleccionada = this.listaNegocio.find(c => c.idlibreria === xdat.libreria?.idlibreria) || null;
    this.pedidoForm.patchValue({
      idpedido: xdat.idpedido,
      fecha: xdat.fecha,
      hora: xdat.hora,
      fecha_entrega: xdat.fecha_entrega,
      negocio: Seleccionada,
    })
  }
  loadingSave = false;
  ModificarPedido() {
     this.loadingSave = true;
    const Seleccionado = this.pedidoForm.get('negocio')?.value as Negocio;
    this.xper = {
        idpedido: this.pedidoForm.get('idpedido')?.value,
        fecha: this.pedidoForm.get('fecha')?.value,
        fecha_entrega: this.pedidoForm.get('fecha_entrega')?.value,
        hora: this.pedidoForm.get('hora')?.value,
        estado: this.pedidoForm.get('estado')?.value,
        libreria: Seleccionado
    },
    this.PedidoService.ModificarPedido(this.xper)
      .subscribe(() => {
       this.modelPedido()
       this.loadingSave = false;
       this.pedidoForm.reset();
       this.guardarPedido();
      });
  
  }
    // modificar detetallePedido
  vistaDetPedido(xdat: DetallePedido) { 
    const Seleccionada1 = this.listaCatalogo.find(c => c.idcatalogo === xdat.catalogo?.idcatalogo) || null; 
    this.detpedidoForm.patchValue({
      iddetalle_pedido: xdat.iddetalle_pedido,
      precio_subtotal: xdat.precio_subtotal,
      cantidad: xdat.cantidad,
      catalogo: Seleccionada1,
      estado: xdat.estado,
      pedido: xdat.pedido,
    
    })
  }
  ModificarDetallePedido() {
    const cataSeleccionado = this.detpedidoForm.get('catalogo')?.value as Catalogo;
  const cantidadSeleccionada = this.detpedidoForm.get('cantidad')?.value;
    this.xper1 = {
        iddetalle_pedido: this.detpedidoForm.get('iddetalle_pedido')?.value,
        estado: this.detpedidoForm.get('estado')?.value,
        cantidad: cantidadSeleccionada,
        precio_subtotal: cantidadSeleccionada * cataSeleccionado.precio,
        catalogo: cataSeleccionado,
        pedido: this.ObtenerPedido,
    },
     console.log("enviadno datos al back end para modificar",this.xper1);
    this.detPedidoService.ModificarDetallePedido(this.xper1)
      .subscribe(() => {
      this.verDetallePedido(this.pedidoSeleccionado?.idpedido!);

      });
  
  }
// cambiar estado de pedido
  perInfo3="";
 modificarEstadoPedido!: Pedido;   
cambiarEstadoSwitchPedido(value: boolean, persona: Pedido) {
  
  this.perInfo3 = persona.libreria?.razon_social!;
  this.modificarEstadoPedido = persona;

  if (value === false) {
    this.Eliminar();
    this.messageService.add({ 
  severity: 'info', 
  summary: 'Pedido cancelado', 
  detail: 'Este pedido ha sido cancelado y no está disponible para modificaciones.', 
  life: 5000 
 
    });

  } else {
    this.Habilitar();
  this.messageService.add({ 
  severity: 'success', 
  summary: 'Pedido habilitado nuevamente', 
  detail: 'El pedido ha sido reactivado y está disponible.', 
  life: 5000 
    });
  }
}
  
  Habilitar() {
    console.log("paso");
    if (this.modificarEstadoPedido.estado == 0) {
      this.PedidoService.cambiarEstadoPedido(this.modificarEstadoPedido).subscribe((xper) => {
          this.modelPedido();
      });
    }
  }
    Eliminar() {
      console.log("paso");
    if (this.modificarEstadoPedido.estado == 1) {
      this.PedidoService.cambiarEstadoPedido(this.modificarEstadoPedido).subscribe((xper) => {
          this.modelPedido();
      });
    }
    }
// cambiar estado de tetalle pedido
perInfoDetPedido = '';
modificarEstadoDetallePedido!: DetallePedido;

cambiarEstadoSwitch(value: boolean, persona: DetallePedido) {
  this.perInfoDetPedido = persona.catalogo?.nombre!;
  this.modificarEstadoDetallePedido = persona;

  if (value === false) {
    this.EliminarDetallePedido();
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Detalle pedido deshabilitado', 
      detail: 'Se encuentra deshabilitado.', 
      life: 5000 
    });

  } else {
    this.HabilitarDetallePedido();
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Item completado', 
      detail: 'Estado completado correctamente...', 
      life: 5000 
    });
  }
}

HabilitarDetallePedido() {
  const pedidoId = this.modificarEstadoDetallePedido.pedido?.idpedido ?? this.modificarEstadoDetallePedido.idpedido;

  if (this.modificarEstadoDetallePedido.estado === 0 && pedidoId) {
    const payload = {
      ...this.modificarEstadoDetallePedido,
      pedidoIdpedido: pedidoId
    };

    this.detPedidoService.cambiarEstadoDetPedido(payload).subscribe(() => {
      this.verDetallePedido(this.pedidoSeleccionado?.idpedido!);

    });
  } else {
    console.warn("No se pudo habilitar detalle. Estado:", this.modificarEstadoDetallePedido.estado, "Pedido ID:", pedidoId);
  }
}


EliminarDetallePedido() {
  console.log(">>> Ejecutando EliminarDetallePedido()");
  const pedidoId = this.modificarEstadoDetallePedido.pedido?.idpedido;

  if (this.modificarEstadoDetallePedido.estado === 1 && pedidoId) {
    const payload = {
      ...this.modificarEstadoDetallePedido,
      pedidoIdpedido: pedidoId
    };

    console.log(">>> Payload que se enviará al backend:", payload);

    this.detPedidoService.cambiarEstadoDetPedido(payload).subscribe((xper) => {
      console.log(">>> Respuesta del backend:", xper);
       this.verDetallePedido(this.pedidoSeleccionado?.idpedido!);
       
    });
  } else {
    console.warn("No se pudo eliminar detalle. Estado:", this.modificarEstadoDetallePedido.estado, "Pedido ID:", pedidoId);
  }
}









  
  confirm4(event: Event) {
  this.confirmationService.confirm({
    target: event.target as EventTarget,
    message: `¿Deseas habilitar el pedido de: ${this.perInfo3}?`,
    header: 'Confirmar habilitación',
    icon: 'pi pi-check-circle',
    rejectLabel: 'Cancelar',
    rejectButtonProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true,
    },
    acceptButtonProps: {
      label: 'Habilitar',
      severity: 'success',
    },
    accept: () => { 
      this.Habilitar();
      this.messageService.add({
        severity: 'success',
        summary: 'Pedido habilitado',
        detail: `${this.perInfo} se habilitó correctamente.`,
        life: 3000
      });
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Habilitación cancelada',
        detail: `No se habilitó el pedido.`,
        life: 3000
      });
    }
  });
}
confirm5(event: Event) {
  this.confirmationService.confirm({
    target: event.target as EventTarget,
    message: `¿Deseas cancelar el pedido de: ${this.perInfo3}?`,
    header: 'Confirmar cancelación',
    icon: 'pi pi-times-circle',
    rejectLabel: 'Cancelar',
    rejectButtonProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true,
    },
    acceptButtonProps: {
      label: 'Cancelar pedido',
      severity: 'danger',
    },
    accept: () => {
      this.Eliminar();
      this.messageService.add({
        severity: 'warn',
        summary: 'Pedido cancelado',
        detail: `El pedido de ${this.perInfo} fue cancelado correctamente.`,
        life: 3000
      });
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Cancelación anulada',
        detail: `No se canceló el pedido.`,
        life: 3000
      });
    }
  });
}



  visible: boolean = false;
  visibleC: boolean = false;
  visibleDC: boolean = false;
  PedidoSeleccionada!: Pedido;
  
  showDialog(Pedido: Pedido) {
    
    this.PedidoSeleccionada = Pedido;
    this.visible = true;  // Abre el diálogo
     this.detPedidoService.ListarDetallePedidoID(Pedido.idpedido!).subscribe((resp) => {
    this.listaDetallePedido = resp;
    console.log("Detalles cargados al abrir modal:", resp);
  });
  }
  
  
      guardarRegistro() {
    this.visible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'El registro fue guardado exitosamente.',
      life: 3000
    });
  }
  
  cancelarRegistro() {
    this.visible = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  }  
  
  showDialogC(Pedido: Pedido) {
    this.PedidoSeleccionada = Pedido;
    this.visibleC = true;  // Abre el diálogo
  }
  
  guardarPedido() {
    this.visibleC = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizando',
      detail: 'El registro fue actualizado exitosamente.',
      life: 3000
    });
  }
  
  cancelarPedido() {
    this.visibleC = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  } 
  
  showDialogDC(Pedido: DetallePedido) {
    
    this.visibleDC = true;  // Abre el diálogo
  }
  
  guardarDPedido() {
    this.visibleDC = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizando',
      detail: 'El registro fue actualizado exitosamente.',
      life: 3000
    });
  }
  
  cancelarDPedido() {
    this.visibleDC = false;
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'No se realizó ninguna operación.',
      life: 3000
    });
        
  } 
    
  // eliminar negocio
    perInfo = '';
    eliminardetPedido!: DetallePedido;
    vistaEliminar(fall: DetallePedido ){
      this.perInfo = fall.catalogo?.nombre!;
      this.eliminardetPedido = fall;
    }

    EliminarDetPedido() {
      if (this.eliminardetPedido && this.eliminardetPedido.iddetalle_pedido) {
        this.detPedidoService.eliminarDetPedido(this.eliminardetPedido.iddetalle_pedido).subscribe({
          next: () => {
          this.verDetallePedido(this.pedidoSeleccionado?.idpedido!);
            }
        })
      }
    }
  
      confirm2(event: Event) {
          this.confirmationService.confirm({
              target: event.target as EventTarget,
             message: `¿Estás seguro de eliminar: ${this.perInfo}?`,
              header: 'Confirmar Eliminacion',
              icon: 'pi pi-info-circle',
              rejectLabel: 'Cancel',
              rejectButtonProps: {
                  label: 'Cancelar',
                  severity: 'secondary',
                  outlined: true,
              },
              acceptButtonProps: {
                  label: 'Eliminar',
                  severity: 'danger',
              },
  
              accept: () => {
                this.EliminarDetPedido(); 
                this.messageService.add({ severity: 'success',
                summary: '¡Eliminación exitosa!', detail: `${this.perInfo} fue eliminado correctamente.`,
               life: 3000
               });
               },
             reject: () => {
                this.messageService.add({severity: 'warn', summary: 'Operación cancelada', detail: `No se eliminó ${this.perInfo}.`,
             life: 3000
             });
              }
  
          });
      }
  
   @ViewChildren('menuDetalle') menus!: QueryList<ElementRef>;
  
    // Detecta cualquier clic fuera de los <details>
    @HostListener('document:click', ['$event'])
    cerrarMenusFuera(event: Event) {
      this.menus?.forEach((ref) => {
        if (ref.nativeElement.hasAttribute('open') && !ref.nativeElement.contains(event.target)) {
          ref.nativeElement.removeAttribute('open');
        }
      });
    }
    mostrarFiltros: boolean = false;

toggleFiltros(): void {
  this.mostrarFiltros = !this.mostrarFiltros;
}
}