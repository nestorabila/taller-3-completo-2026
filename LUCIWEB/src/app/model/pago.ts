import { MetodoPago } from "./metodo-pago";
import { Pedido } from "./pedido";
import { Persona } from "./persona";

export interface Pago {
    idpago: number,
    fecha: Date,
    hora: string,
    monto: number,
    idpersona?: number;   // se guarda en BD 💾
    persona?: Persona;  //aqui biene la persona que resitro el pago
    estado: number,
    nota: string,
    pedido?: Pedido,
    precio_subtotal: any,
    metodo_pago?: MetodoPago,
}
