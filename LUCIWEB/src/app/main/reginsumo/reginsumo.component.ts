import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-reginsumo',
   imports: [ProgressSpinnerModule, NgxPaginationModule, ToastModule,ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
     providers: [ConfirmationService, MessageService],
  templateUrl: './reginsumo.component.html',
  styleUrl: './reginsumo.component.css'
})
export class ReginsumoComponent {
pag=1;



limpiarNumeroDecimal(event: any): void {
  let valor = event.target.value;
  valor = valor.replace(/[^0-9.]/g, '');
  const partes = valor.split('.');
  if (partes.length > 2) {
    partes[1] = partes.slice(1).join(''); 
  }

  let parteEntera = partes[0] || '';
  let parteDecimal = partes[1] || '';

  parteEntera = parteEntera.replace(/^0+(?=\d)/, ''); 
  parteEntera = parteEntera.substring(0, 5);
  parteDecimal = parteDecimal.substring(0, 2);

  if (valor.endsWith('.') && parteDecimal === '') {
    valor = parteEntera + '.';
  } else if (parteDecimal) {
    valor = `${parteEntera}.${parteDecimal}`;
  } else {
    valor = parteEntera;
  }

  event.target.value = valor;

  const index = event.target.dataset.index;
  if (index !== undefined) {
    this.detalleCompraData[index].precio_u = valor;
  }
}

  limpiarNumero(event: any): void {
  let valor = event.target.value || '';
  valor = valor.replace(/[^0-9]/g, '');
  valor = valor.replace(/^0+/, '');
   if (valor.length > 5) {
    valor = valor.substring(0, 5);
  }
  event.target.value = valor;
}

limpiarLetra(event: any): void {
  let valor: string = event.target.value || '';
  valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
  valor = valor.replace(/\s{2,}/g, ' '); 
  let isTypingSpace = valor.endsWith(' ');

  valor = valor.replace(/^\s+/, '');
  if (valor.length > 100) {
    valor = valor.substring(0, 100);
  }
  if (isTypingSpace && !valor.endsWith(' ')) {
    valor += ' ';
  }

  event.target.value = valor;
}

  ObtenerCategoria!: Categoria;
  listaProducto: Producto[]=[];
  listaCategoria: Categoria[]=[];
  listaProveedor: Proveedor[]=[];
  listaEmpaque: Empaque[]=[];
  listaCompra: Insumo[]=[];
  listaDetalleCompra: DetalleInsumo[]=[];

    subcateForm: any = new FormGroup({
        idproducto: new FormControl(''),
        nombre: new FormControl(''),
        descripcion: new FormControl(''),
        categoria: new FormControl(''),
      })
      cateForm: any = new FormGroup({
        idcategoria: new FormControl(''),
        nombre: new FormControl(''),
        hora: new FormControl(''),
        fecha: new FormControl(''),
      })

       detcompraForm: any = new FormGroup({
        iddetalle_compra: new FormControl(''),
        precio: new FormControl('',[Validators.required, Validators.pattern(/^[1-9]\d{0,4}$/)]),
        cantidad: new FormControl('',[Validators.required, Validators.pattern(/^[1-9]\d{0,3}$/)]),
        cantidad_u: new FormControl(''),
        observacion: new FormControl(''),
        compra: new FormControl(''),
        empaque: new FormControl('',[Validators.required]),
        producto:new FormControl(''),
      })

      compraForm: any = new FormGroup({
        idcompra: new FormControl(''),
        fecha: new FormControl(''),
        hora: new FormControl(''),
        proveedor: new FormControl(''),
      })

      empaqueForm: any = new FormGroup({
        idempaque: new FormControl(''),
        nombre: new FormControl(''),
      })

constructor(private prodService: ProductoService,  private empaqueService: EmpaqueService, private compraService: InsumoService, private detcompraService: DetalleInsumoService,   private proveService: ProveedorService, private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService) {}

modelCategoria() {
  this.cateService.ListarCategoria().subscribe((fall) => {
    this.listaCategoria =fall.filter(p => p.estado === 0);
    fall.sort((a, b) => b.idcategoria - a.idcategoria);
  });
}
loading: boolean = false;
modelProducto() {
  this.loading = true;
  this.prodService.ListarProducto().subscribe((fall) => {
    this.listaProducto = fall;
    this.loading = false;
  });
}
 modelProveedor() {
    this.proveService.ListarProveedor().subscribe((fall) => (this.listaProveedor = fall))
  }
    modelProductoID() {
  if (this.ObtenerCategoria) {
    this.prodService.ListarProductoID(this.ObtenerCategoria.idcategoria).subscribe((fall) => {
      this.listaProducto
     = fall;
      
    });
  } else {
    
  }
}
vista(fall: Categoria) {
    this.ObtenerCategoria = fall; 
    this.modelProductoID(); 
  }
  productosSeleccionados: Producto[] = [];
idsProductosSeleccionados: number[] = []; 
 toggleProductoSeleccionado(event: Event, producto: Producto): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    // Agregar ID del producto seleccionado
    this.idsProductosSeleccionados.push(producto.idproducto);
    
    // Agregar producto al arreglo de productos seleccionados
    this.productosSeleccionados.push(producto);

    // Agregar entrada vacía para los datos de detalle de compra
    this.detalleCompraData.push({
      cantidad_u: null,
      cantidad_e: null,
      cantidad_t: null,
      precio_u: null,
      precio_t: null,
      observacion: '',
      empaque: null,
      producto: producto
    });
  } else {
    // Quitar ID del producto
    this.idsProductosSeleccionados = this.idsProductosSeleccionados.filter(id => id !== producto.idproducto);

    // Encontrar el índice del producto en productosSeleccionados
    const index = this.productosSeleccionados.findIndex(p => p.idproducto === producto.idproducto);

    // Eliminar tanto de productosSeleccionados como de detalleCompraData
    if (index !== -1) {
      this.productosSeleccionados.splice(index, 1);
      this.detalleCompraData.splice(index, 1);
    }
  }
}


modelCompra() {
    this.compraService.ListarCompra().subscribe((fall) => (this.listaCompra = fall))
  }
  modelDetalleCompra() {
    this.detcompraService.ListarDetalleCompra().subscribe((fall) => (this.listaDetalleCompra = fall))
  }
  modelEmpaque() {
  this.empaqueService.ListarEmpaque().subscribe((fall) => {
    this.listaEmpaque = fall;
  });
}
  ngOnInit(): void {
    this.modelCategoria();
    this.modelProducto();
    this.modelProveedor();
    this.modelCompra();
    this.modelEmpaque(),
    this.modelDetalleCompra();
    this.modelProductoID();
  }
proveedorSeleccionado!: Proveedor;
detalleCompraData: any[] = [];
limpiarTodo() {
  this.proveedorSeleccionado = null!;
  this.productosSeleccionados = [];
  this.idsProductosSeleccionados = [];
  this.detalleCompraData = [];
}

registrarTodo() {
   this.loadingSave = true;
  const fecha = new Date();
  const hora = fecha.toTimeString().split(' ')[0];

  // Paso 1: Registrar la compra
  const compraData = {
    fecha: fecha,
    hora: hora,
    proveedor: this.proveedorSeleccionado
  };
   
   
  this.compraService.RegistrarCompra(compraData).subscribe((compraCreada: any) => {
    const idCompra = compraCreada.idcompra;

    // Creamos el objeto completo que cumple con la interfaz Insumo
    const compraCompleta = {
      idcompra: idCompra,
      fecha: compraData.fecha,
      hora: compraData.hora,
      proveedor: compraData.proveedor
    };
    // Paso 2: Registrar todos los detalles asociados
  const detalles = this.detalleCompraData.map(det => {
  const cantidad_e = Number(det.cantidad_e) || 0;  // cantidad de empaques
  const cantidad_u = Number(det.cantidad_u) || 0;  // unidades por empaque
  const precio_u = Number(det.precio_u) || 0;      // precio por empaque

  // Cálculos automáticos
  const cantidad_t = cantidad_e * cantidad_u;
  const precio_t = precio_u * cantidad_e;

  return {
    cantidad_u: det.cantidad_u,
    cantidad_e: det.cantidad_e,
    cantidad_t: cantidad_t, 
    precio_u: det.precio_u,
    precio_t: precio_t,    
    observacion: det.observacion,
    empaque: det.empaque,
    producto: det.producto,
    compra: compraCompleta
  };
});


    let registrados = 0;
    for (let detalle of detalles) {
      this.detcompraService.RegistrarDetalleCompra(detalle).subscribe(() => {
        registrados++;
        if (registrados === detalles.length) {
          this.messageService.add({
            severity: 'success',
            summary: 'Compra Registrada',
            detail: 'Todos los productos se registraron correctamente'
          });
           this.loadingSave = false
          this.limpiarTodo();
        }
      });
    }
  });
}
loadingSave = false;

verificarYRegistrar() {
  if (!this.proveedorSeleccionado) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Debe seleccionar un proveedor',
      detail: 'Seleccione un proveedor antes de guardar la compra',
      life: 3000
    });
    return;
  }


  this.registrarTodo();
}

actualizarEmpaque(index: number): void {
  const empaqueSeleccionado = this.detalleCompraData[index].empaque;

  if (empaqueSeleccionado && empaqueSeleccionado.nombre?.toLowerCase() === 'unidad') {
    this.detalleCompraData[index].cantidad_u = 1;
  } else {
    this.detalleCompraData[index].cantidad_u = null;
  }
}

}