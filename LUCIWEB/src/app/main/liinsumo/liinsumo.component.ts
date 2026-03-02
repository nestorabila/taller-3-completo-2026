import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Categoria } from 'src/app/model/categoria';
import { DetalleInsumo } from 'src/app/model/detalle-insumo';
import { Empaque } from 'src/app/model/empaque';
import { Insumo } from 'src/app/model/insumo';
import { Proveedor } from 'src/app/model/proveedor';
import { CategoriaService } from 'src/app/servicio/categoria.service';
import { DetalleInsumoService } from 'src/app/servicio/detalle-insumo.service';
import { EmpaqueService } from 'src/app/servicio/empaque.service';
import { InsumoService } from 'src/app/servicio/insumo.service';
import { ProveedorService } from 'src/app/servicio/proveedor.service';
import { SplitButton } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { SplitterModule } from 'primeng/splitter';
import { NgxPaginationModule } from 'ngx-pagination';
import { Producto } from 'src/app/model/producto';
import { ProductoService } from 'src/app/servicio/producto.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-liinsumo',
  imports: [DropdownModule, ProgressSpinnerModule, NgxPaginationModule, SplitterModule, FieldsetModule,AvatarModule,ConfirmDialog , MenuModule, ToastModule, Dialog, ReactiveFormsModule, FormsModule,  InputTextModule, CommonModule, ConfirmPopupModule, ToastModule, ButtonModule],
  providers: [ConfirmationService, MessageService],
  
  templateUrl: './liinsumo.component.html',
  styleUrl: './liinsumo.component.css'
})
export class LiinsumoComponent {
  pag= 1;
  mostrarDetalle = false;
  toggleDetalle() {
    this.mostrarDetalle = !this.mostrarDetalle;
  }


  ObtenerCategoria!: Categoria;
    listaProducto: Producto[]=[];
    listaCategoria: Categoria[]=[];
    listaProveedor: Proveedor[]=[];
    listaEmpaque: Empaque[]=[];
    listaCompra: Insumo[]=[];
    listaDetalleCompra: DetalleInsumo[]=[];
  
      subcateForm: any = new FormGroup({
          idsubc: new FormControl(''),
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
          precio_u: new FormControl('', [ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern(/^(?:0\.[1-9]\d?|[1-9]\d{0,4}(?:\.\d{1,2})?)$/)]),
          cantidad_e: new FormControl('', [ Validators.required,Validators.minLength(1),Validators.maxLength(4),Validators.pattern(/^[1-9][0-9]*$/) ]),
          cantidad_u: new FormControl('',[ Validators.required,Validators.minLength(1),Validators.maxLength(4),Validators.pattern(/^[1-9][0-9]*$/) ]),
          observacion: new FormControl('',[Validators.minLength(4),Validators.maxLength(80)]),
          compra: new FormControl(''),
          idcompra: new FormControl(''),
          empaque: new FormControl('', Validators.required),
          producto:new FormControl('',Validators.required),
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
  
  constructor(private prodService: ProductoService, private empaqueService: EmpaqueService, private compraService: InsumoService, private detcompraService: DetalleInsumoService,   private proveService: ProveedorService, private cateService: CategoriaService, private confirmationService: ConfirmationService, private messageService: MessageService) {
 
  }

  modelCategoria() {
    this.cateService.ListarCategoria().subscribe((fall) => {
      this.listaCategoria = fall;
    });
  }

  
  modelProducto() {
    this.prodService.ListarProducto().subscribe((fall) => {
      this.listaProducto = fall;
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
  loading: boolean = false;
  modelCompra() {
    this.loading= true
      this.compraService.ListarCompra().subscribe((fall) =>{
         this.listaCompra = fall.sort((a, b) => b.idcompra! - a.idcompra!);
         this.loading= false
      })
    }

      Obtenercompra!: Insumo;
   modelDetalleCompraID() {
  if (this.Obtenercompra) {
    this.detcompraService.ListarDetalleCompraID(this.Obtenercompra.idcompra!).subscribe((fall) => {
      this.listaDetalleCompra= fall;
     
      
    });
  } else {
    console.warn('No hay para cargar');
  }
   }
detalleVisibleId: number | null = null;
totalesPorCompra: { [key: number]: number } = {};

toggleDetalleCompra(idcompra: number) {
  if (this.detalleVisibleId === idcompra) {
    this.detalleVisibleId = null;
    this.listaDetalleCompra = [];
  } else {
    this.verDetalleCompra(idcompra);
  }
}

verDetalleCompra(idcompra: number) {
  this.detalleVisibleId = idcompra;
  this.detcompraService.ListarDetalleCompraID(idcompra).subscribe(
    (resp) => {
      this.listaDetalleCompra = resp;
      const total = resp.reduce((acc, item) => acc + (item.precio_u * item.cantidad_u), 0);
      this.totalesPorCompra[idcompra] = total;
    },
    (error) => {
      
    }
  );
}



getTotal(idcompra: number | undefined): number | null {
  if (idcompra === undefined) return null;
  return this.totalesPorCompra[idcompra] ?? null;
}

onSeleccionarEmpaque(event: Event): void {
  const empaqueSeleccionado = (event.target as HTMLSelectElement).value;
  const objEmpaque = this.detcompraForm.get('empaque')?.value;

  if (objEmpaque?.nombre?.toLowerCase() === 'unidad') {
    this.detcompraForm.get('cantidad_u')?.setValue(1);
    this.detcompraForm.get('cantidad_u')?.disable();
  } else {
    this.detcompraForm.get('cantidad_u')?.enable();
    this.detcompraForm.get('cantidad_u')?.reset();
  }
}


    ngOnInit(): void {
     this.modelCategoria();
     this.modelProducto();
    this.modelProveedor();
    this.modelCompra();
    this.modelEmpaque(),
    this.modelDetalleCompraID();
    }
 
  
  // añadir mas compras
   xper!: any;
  registrarCompra() {
        const fecha = new Date();
        const hora = fecha.toTimeString().split(' ')[0];
      this.xper = {
        fecha: fecha,
        hora: hora,
        
      },
      this.compraService
        .RegistrarCompra(this.xper)
        .subscribe(() => {
         this.modelCompra()
          this.compraForm.reset();
        });
    }
  // añadir mas detales compras
  xper1!: any;
  registrarDetalleCompra() {
    const empaqueSeleccionado = this.detcompraForm.get('empaque')?.value as Empaque;
    const subcaSeleccionado = this.detcompraForm.get('producto')?.value as Producto;
     const precio_u = parseFloat(this.detcompraForm.get('precio_u')?.value);
     const cantidad_u = parseInt(this.detcompraForm.get('cantidad_u')?.value);
     const cantidad_e = parseInt(this.detcompraForm.get('cantidad_e')?.value);
      this.xper1 = {
        precio_u: precio_u,
        precio_t: +(precio_u * cantidad_e).toFixed(2),
        cantidad_u: cantidad_u,
        cantidad_e: cantidad_e,
        cantidad_t:  cantidad_u * cantidad_e,
        observacion: this.detcompraForm.get('observacion')?.value,
        empaque: empaqueSeleccionado,
        producto: subcaSeleccionado, 
        compra: this.compraSeleccionada,
      },
     console.log("enviadno datos al back end",this.xper1);
     
      this.detcompraService
        .RegistrarDetalleCompra(this.xper1)
        .subscribe(() => {
         this.modelCompra();
          this.detcompraForm.reset();
        });
    }
  
   // modificar compra
vistaCompra(xdat: Insumo) {  
  const Seleccionada = this.listaProveedor.find(c => c.idproveedor === xdat.proveedor?.idproveedor) || null;
  this.compraForm.patchValue({
    idcompra: xdat.idcompra,
    fecha: xdat.fecha,
    hora: xdat.hora,
    proveedor: Seleccionada,
  })
}
ModificarCompra() {
  const proveedorSeleccionado = this.compraForm.get('proveedor')?.value as Proveedor;
  this.xper = {
      idcompra: this.compraForm.get('idcompra')?.value,
      fecha: this.compraForm.get('fecha')?.value,
      hora: this.compraForm.get('hora')?.value,
      proveedor: proveedorSeleccionado
  },
  this.compraService.ModificarCompra(this.xper)
    .subscribe(() => {
     this.modelCompra()
     this.compraForm.reset();
    });

}
  // modificar detetallecompra
vistaDetCompra(xdat: DetalleInsumo) { 
  const Seleccionada = this.listaEmpaque.find(c => c.idempaque === xdat.empaque?.idempaque) || null;
  const Seleccionada1 = this.listaProducto.find(c => c.idproducto === xdat.producto?.idproducto) || null; 
  this.detcompraForm.patchValue({
    iddetalle_compra: xdat.iddetalle_compra,
    precio_u: xdat.precio_u,
    precio_t: xdat.precio_t,
    cantidad_u: xdat.cantidad_u,
    cantidad_e: xdat.cantidad_e,
    cantidad_t: xdat.cantidad_t,
    observacion: xdat.observacion,
    empaque: Seleccionada,
    producto: Seleccionada1,
  });
  if (Seleccionada?.nombre?.toLowerCase() === 'unidad') {
    this.detcompraForm.get('cantidad_u')?.disable();
  } else {
    this.detcompraForm.get('cantidad_u')?.enable();
  }
}
ModificarDetalleCompra() {
  const empaqueSeleccionado = this.detcompraForm.get('empaque')?.value as Empaque;
  const subcaSeleccionado = this.detcompraForm.get('producto')?.value as Producto;
  const precio_u = parseFloat(this.detcompraForm.get('precio_u')?.value);
     const cantidad_u = parseInt(this.detcompraForm.get('cantidad_u')?.value);
     const cantidad_e = parseInt(this.detcompraForm.get('cantidad_e')?.value);
  this.xper1 = {
      iddetalle_compra: this.detcompraForm.get('iddetalle_compra')?.value,
        precio_u: precio_u,
        precio_t: +(precio_u * cantidad_e).toFixed(2),
        cantidad_u: cantidad_u,
        cantidad_e: cantidad_e,
        cantidad_t:  cantidad_u * cantidad_e,
        observacion: this.detcompraForm.get('observacion')?.value,
        empaque: empaqueSeleccionado,
        producto: subcaSeleccionado, 
       compra: this.compraSeleccionada
  },
  this.detcompraService.ModificarDetalleCompra(this.xper1)
    .subscribe(() => {
     this.verDetalleCompra(this.compraSeleccionada?.idcompra!)
     this.detcompraForm.reset();
    });

}

 productoYaUsado(): boolean {
  const personaSel = this.detcompraForm.get('producto')?.value;
  if (!personaSel) return false;

  return this.listaDetalleCompra.some(
    (p) => p.producto?.idproducto === personaSel.idproducto
  );
}

visible: boolean = false;
visibleC: boolean = false;
visibleDC: boolean = false;
compraSeleccionada!: Insumo;

showDialog(compra: Insumo) {
  this.compraSeleccionada = compra;
  this.visible = true;  // Abre el diálogo
   this.detcompraService.ListarDetalleCompraID(compra.idcompra!).subscribe((fall) => {
    this.listaDetalleCompra = fall;
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

showDialogC(compra: Insumo) {
  this.compraSeleccionada = compra;
  this.visibleC = true;  // Abre el diálogo
}

guardarCompra() {
  this.visibleC = false;
  this.messageService.add({
    severity: 'success',
    summary: 'Actualizando',
    detail: 'El registro fue actualizado exitosamente.',
    life: 3000
  });
}

cancelarCompra() {
  this.visibleC = false;
  this.messageService.add({
    severity: 'info',
    summary: 'Cancelado',
    detail: 'No se realizó ninguna operación.',
    life: 3000
  });
      
} 

showDialogDC(compra: DetalleInsumo) {
  this.compraSeleccionada = compra.compra!;
  this.visibleDC = true;
}

guardarDCompra() {
  this.visibleDC = false;
  this.messageService.add({
    severity: 'success',
    summary: 'Actualizando',
    detail: 'El registro fue actualizado exitosamente.',
    life: 3000
  });
}

cancelarDCompra() {
  this.visibleDC = false;
  this.detcompraForm.reset();
  this.messageService.add({
    severity: 'info',
    summary: 'Cancelado',
    detail: 'No se realizó ninguna operación.',
    life: 3000
  });
      
} 
  
// eliminar negocio
  perInfo = '';
  eliminardetCompra!: DetalleInsumo;
  vistaEliminar(fall: DetalleInsumo ){
    this.perInfo = fall.producto?.nombre!;
    this.eliminardetCompra = fall;
    
  }
  EliminarDetCompra() {
    if (this.eliminardetCompra && this.eliminardetCompra.iddetalle_compra) {
      this.detcompraService.eliminarDetCompra(this.eliminardetCompra.iddetalle_compra).subscribe({
        next: () => {
          this.verDetalleCompra(this.compraSeleccionada?.idcompra!)
        },
      });
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
              this.EliminarDetCompra(); 
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
