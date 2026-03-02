import { Negocio } from "./negocio";
import { Persona } from "./persona";

export interface Pedido {
     idpedido?: number,
    fecha: Date,
    hora: string,
    fecha_entrega?: Date,
    idpersona?: number;   // se guarda en BD 💾
    persona?: Persona;
    estado: number,
    libreria?: Negocio
}

