import { DetallePedido } from "./detalle-pedido";
import { Negocio } from "./negocio";
import { Persona } from "./persona";

export interface Pedido {
    idpedido?: number,
    fecha: Date,
    hora: string,
    fecha_entrega: Date | null; 
    idpersona?: number;   // se guarda en BD 💾
    persona?: Persona;
    estado: number,
    libreria?: Negocio,
    detalle_pedido?: DetallePedido,
    cantidad_total?: number,
    precio_total?: number
}
