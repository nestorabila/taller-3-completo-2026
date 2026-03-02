import { Catalogo } from "./catalogo";
import { Negocio } from "./negocio";
import { Pedido } from "./pedido";

export interface DetallePedido {
    iddetalle_pedido?: number,
    cantidad: number,
    precio_subtotal: number,
    estado: Number,
    catalogo?: Catalogo,
    pedido?: Pedido,
    idpedido?: number,
    
}
