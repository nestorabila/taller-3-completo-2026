import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Carrito } from 'src/app/model/carrito';
import { Catalogo } from 'src/app/model/catalogo';
import { Credencial } from 'src/app/model/credencial';
import { DetallePedido } from 'src/app/model/detalle-pedido';
import { Negocio } from 'src/app/model/negocio';
import { Pedido } from 'src/app/model/pedido';
import { ActualizarnombreService } from 'src/app/servicio/actualizarnombre.service';
import { CarritoService } from 'src/app/servicio/carrito.service';
import { CatalogoService } from 'src/app/servicio/catalogo.service';
import { CredencialService } from 'src/app/servicio/credencial.service';
import { DetallePedidoService } from 'src/app/servicio/detalle-pedido.service';
import { NegocioService } from 'src/app/servicio/negocio.service';
import { DepedidoService } from 'src/app/servicio/pedido.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  standalone: true,
    imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent  implements OnInit {

 carrito: Carrito[] = [];
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
            persona: new FormControl(''),
          })

           detpedidoForm: any = new FormGroup({
            iddetalle_pedido: new FormControl(''),
            cantidad: new FormControl('', Validators.required),
            pedido:  new FormControl(''),
            catalogo: new FormControl('', Validators.required),
          })

  constructor(private credeService: CredencialService, private actualizarService: ActualizarnombreService, private carritoService: CarritoService,  private negocioService: NegocioService,  private PedidoService: DepedidoService, private detPedidoService: DetallePedidoService,   private proveService: CatalogoService, ) {}
    modelCliente() {
  this.negocioService.ListarNegocioCompleto().subscribe((fall) => {
    this.listaNegocio = fall.filter(p => p.persona?.estado== 1)
    .sort((a, b) => b.idlibreria - a.idlibreria);
  });
}
modelPedido() {
        this.PedidoService.ListarPedido().subscribe((fall) =>{
           this.listaPedido = fall.sort((a, b) => b.idpedido! - a.idpedido!);
        })
      }
   mostrarLogin: boolean = false;
negocios: any[] = [];
negocioSeleccionado: any = null;

ngOnInit(): void { 
  const token = localStorage.getItem('token');

  if (!token) {
    this.mostrarLogin = true;
    return;
  }
  this.modelCliente();
  this.modelPedido();
  this.carrito = this.carritoService.obtenerCarrito();

  // Cargar negocios del cliente
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const idPersona = usuario?.idpersona;

  if (idPersona) {
    this.negocioService.ListarNegocio(idPersona).subscribe((negocios) => {
      this.negocios = negocios;
      if (this.negocios.length === 1) {
        this.negocioSeleccionado = this.negocios[0]; // auto seleccionar si solo hay uno
      }
    });
  }
}

// registrar pedido
enviarPedido() {
  const fecha = new Date();
  const hora = fecha.toTimeString().split(' ')[0];
 const idpersona = Number(localStorage.getItem('idpersona'));
  const usuario = JSON.parse(localStorage.getItem('usuarioCompleto') || '{}');
  const idPersona = usuario?.idpersona;
  const nombrePersona = usuario?.nombreCompleto;

  if (!idPersona) {
    console.error("No se encontró el ID de la persona");
    return;
  }

  if (!this.negocioSeleccionado) {
    console.error("Debe seleccionar un negocio");
    return;
  }

  // Crear el objeto del pedido con el negocio seleccionado
  const nuevoPedido = {
    fecha: fecha,
    hora: hora,
    idpersona,
    estado: 1,
    libreria: this.negocioSeleccionado
  };

  this.PedidoService.RegistrarPedido(nuevoPedido).subscribe((pedidoRegistrado) => {
    console.log("✅ Pedido registrado correctamente:", pedidoRegistrado);

    this.carrito.forEach(item => {
      const detalle: DetallePedido = {
        cantidad: item.cantidad,
        precio_subtotal: item.precio * item.cantidad,
        catalogo: { idcatalogo: item.idcatalogo } as Catalogo,
        pedido: pedidoRegistrado
      };

      this.detPedidoService.RegistrarDetallePedido(detalle).subscribe(() => {
        console.log("📦 Detalle registrado:", detalle);
      });
    });
    this.confirmarEnvioPedido();
    this.vaciarCarrito();
  });
}


calcularTotal(): number {
  return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

eliminarDelCarrito(idcatalogo: number) {
  this.mostrarMensaje('Catalogo quitado correctamente');
  this.carritoService.eliminarProducto(idcatalogo); // <-- pasas solo el ID correcto
  this.carrito = this.carritoService.obtenerCarrito(); 
  
}
mensajeEmergente: string = '';

mostrarMensaje(mensaje: string, duracion: number = 4000) {
  this.mensajeEmergente = mensaje;
  setTimeout(() => {
    this.mensajeEmergente = '';
  }, duracion);
}


vaciarCarrito() {
  this.mostrarMensaje('Carrito vaciado correctamente');
  this.carrito = [];
 this.carritoService.limpiarCarrito();
  
}





mostrarConfirmacionEnvio() {
  this.confirmarEnvio = true;
}

cancelarEnvio() {
  this.confirmarEnvio = false;
}

confirmarEnvioPedido() {
  this.confirmarEnvio = false;
    this.mostrarMensaje('su pedido fue enviado correctamente');
     this.carrito = [];
 this.carritoService.limpiarCarrito();
  
  
}
confirmarEnvio: boolean = false; // mostrar/ocultar el modal


 // login
    credencial: Credencial = {
        usuario: '',
        contrasena: ''
      };
      mensaje: string = '';
      exito: boolean | null = null; 

       mostrarMensaje1(msg: string, exito: boolean) {
  this.mensaje = msg;
  this.exito = exito;

  // Oculta el mensaje después de 3 segundos
  setTimeout(() => {
    this.mensaje = '';
    this.exito = null;
  }, 3000); // 3000 ms = 3 segundos
}
cargando: boolean = false;  
   iniciarSesion() {
    if (!this.credencial.usuario || !this.credencial.contrasena) {
     this.mostrarMensaje1('Ingrese su usuario y contraseña', false);
      this.exito = false;
      return;
    }
    this.cargando = true;
    this.credeService.iniciarSesion(this.credencial.usuario, this.credencial.contrasena)
      .subscribe({
        next: (res) => {
          console.log('ROL del usuario:', res.rol?.idrol);
  
          if (res.estado === 0) {
            this.exito = false;
            this.mostrarMensaje1('Sus credenciales han sido bloqueadas. No puede acceder.', false);
            return;
          }
  
          if (res.rol === 'Cliente') {
            this.exito = true;
            localStorage.setItem('token', res.token);
            localStorage.setItem('idpersona', res.idpersona);
            localStorage.setItem('usuarioCompleto', JSON.stringify(res));
            this.actualizarService.notificarCambio();
               this.mostrarLogin = false;
  
           this.modelCliente();
    this.modelPedido()
    this.carrito = this.carritoService.obtenerCarrito();
  
          } else {
            this.exito = false;
            this.mostrarMensaje1('Lo siento no tienes permisos.', false);
          }
        },
        error: (err) => {
          this.cargando = false;
          this.exito = false;
          this.mostrarMensaje1('Usuario o contraseña Incorrecto', false);
          console.error('Error en login:', err); 
        }
      });
  }


}
