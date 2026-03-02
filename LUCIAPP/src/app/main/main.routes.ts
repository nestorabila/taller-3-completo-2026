import { Routes } from "@angular/router";
import { CatalogoComponent } from "./catalogo/catalogo.component";
import { PerfilComponent } from "./perfil/perfil.component";
import { RegistrarseComponent } from "./registrarse/registrarse.component";
import { LibreriaComponent } from "./libreria/libreria.component";
import { LoginComponent } from "./login/login.component";
import { PedidoComponent } from "./pedido/pedido.component";
import { CarritoComponent } from "./carrito/carrito.component";
import { FaboritoComponent } from "./faborito/faborito.component";
import { BuscadorComponent } from "./buscador/buscador.component";
import { UbicacionComponent } from "./ubicacion/ubicacion.component";
import { TerminosComponent } from "./terminos/terminos.component";
import { AcercadeComponent } from "./acercade/acercade.component";



export const MainRoutes: Routes = [
    {
      path: '',
      component: CatalogoComponent, 
    },
    {
      path: 'listar/catalogos',
      component: CatalogoComponent
    },
   
    {
      path: 'perfil',
      component: PerfilComponent 
    },

    {
      path: 'carrito',
      component: CarritoComponent 
    },
     {
      path: 'faborito',
      component: FaboritoComponent 
    },
    {
      path: 'ubicacion',
      component: UbicacionComponent 
    },
    {
      path: 'terminos',
      component: TerminosComponent 
    },
    {
      path: 'acercade',
      component: AcercadeComponent 
    },
     {
      path: 'buscar',
      component: BuscadorComponent 
    },

    {
      path: 'iniciar/sesion',
      component: LoginComponent
    },
    {
      path: 'negocio',
      component: LibreriaComponent
    },

    {
      path: 'registrarse',
      component: RegistrarseComponent 
    },

    {
      path: 'pedidos',
      component: PedidoComponent 
    },

]