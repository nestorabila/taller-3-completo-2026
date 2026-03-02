import { Catalogo } from "./catalogo";
import { Pedido } from "./pedido";

export interface DetallePedido {
    iddetalle_pedido?: number,
    cantidad: number,
    estado?:number,
    precio_subtotal: number,
    catalogo?: Catalogo,
    pedido?: Pedido,
}
