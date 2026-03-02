import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { PersonaComponent } from "./persona/persona.component";
import { HomeComponent } from "./home/home.component";
import { CategoriaComponent } from "./categoria/categoria.component";
import { ProveedorComponent } from "./proveedor/proveedor.component";
import { CatalogoComponent } from "./catalogo/catalogo.component";
import { PedidosComponent } from "./pedidos/pedidos.component";
import { ReginsumoComponent } from "./reginsumo/reginsumo.component";
import { LiinsumoComponent } from "./liinsumo/liinsumo.component";
import { RegifacturaComponent } from "./regifactura/regifactura.component";
import { RegipedidosComponent } from "./regipedidos/regipedidos.component";
import { ReportepersonaComponent } from "./reportepersona/reportepersona.component";
import { ReportecatepedidosComponent } from "./reportecatepedidos/reportecatepedidos.component";
import { ReportecategoriaComponent } from "./reportecategoria/reportecategoria.component";
import { ReporteproveedorComponent } from "./reporteproveedor/reporteproveedor.component";
import { ReportecatecatalogoComponent } from "./reportecatecatalogo/reportecatecatalogo.component";
import { ReportecatecomprasComponent } from "./reportecatecompras/reportecatecompras.component";
import { ReportefacturacionComponent } from "./reportefacturacion/reportefacturacion.component";
import { ReportepagoComponent } from "./reportepago/reportepago.component";
import { ListarfacturaComponent } from "./listarfactura/listarfactura.component";
import { NegocioComponent } from "./negocio/negocio.component";
import { ConfiguracionComponent } from "./configuracion/configuracion.component";
import { ReportelibreriaComponent } from "./reportelibreria/reportelibreria.component";
import { TipocategoriaComponent } from "./tipocategoria/tipocategoria.component";
import { ProductoComponent } from "./producto/producto.component";
import { ReporteproductoComponent } from "./reporteproducto/reporteproducto.component";
import { ErrorComponent } from "./error/error.component";
import { authGuard } from "../servicio/auth.guard"; 


export const MainRoutes: Routes = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [authGuard]
    },
    {
      path: 'dashboard',
      component: DashboardComponent
    },
    {
      path: 'error',
      component: ErrorComponent
    },
     {
      path: 'configuracion',
      component: ConfiguracionComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/persona',
      component: PersonaComponent
    },
    {
      path: 'gestionar/negocio',
      component: NegocioComponent
    },
     {
      path: 'gestionar/productos',
      component: ProductoComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/persona/reporte',
      component: ReportepersonaComponent
    },
     {
      path: 'gestionar/libreria/reporte',
      component: ReportelibreriaComponent,
    },
    {
      path: 'gestionar/categoria',
      component: CategoriaComponent,
      
    },
    {
      path: 'gestionar/categoria/reporte',
      component: ReportecategoriaComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/proveedor',
      component: ProveedorComponent
    },
    {
      path: 'gestionar/proveedor/reporte',
      component: ReporteproveedorComponent
    },
    {
      path: 'gestionar/producto/reporte',
      component: ReporteproductoComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/catalogo',
      component: CatalogoComponent
    },
     {
      path: 'gestionar/categoriacatalogo',
      component: TipocategoriaComponent
    },
    {
      path: 'gestionar/catalogo/reporte',
      component: ReportecatecatalogoComponent
    },
    {
      path: 'gestionar/pedido/listar_pedidos',
      component: PedidosComponent
    },
    {
      path: 'gestionar/pago/listar_pago',
      component: RegifacturaComponent
    },

    {
      path: 'gestionar/pago/reporte',
      component: ReportepagoComponent
    },

     {
      path: 'gestionar/pedido/registrar_pedido',
      component: RegipedidosComponent
    },
    {
      path: 'gestionar/pedido/reporte',
      component: ReportecatepedidosComponent
    },
    {
      path: 'gestionar/compras/registrar_insumos',
      component: ReginsumoComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/compras/listar_insumos',
      component: LiinsumoComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/compras/reporte',
      component: ReportecatecomprasComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },
    {
      path: 'gestionar/factura/registrar',
      component: RegifacturaComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },

     {
      path: 'gestionar/ventas/reporte',
      component: ReportefacturacionComponent,
      canActivate: [authGuard],
      data: { roles: ['Administrador'] }
    },

     {
      path: 'gestionar/lista/ventas',
      component: ListarfacturaComponent,
    },
    {
      path: 'gestionar/lista/ventas',
      component: ReportefacturacionComponent,
    },
]