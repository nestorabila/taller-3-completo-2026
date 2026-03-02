import { MetodoPago } from "./metodo-pago";
import { Pedido } from "./pedido";
import { Persona } from "./persona";


export interface Factura {
    idventa: number,
	fecha: Date,
	hora: string,
	idpersona?: number;   // se guarda en BD 💾
	persona?: Persona;
	estado: number,
	pedido?: Pedido,
	idmetodo: number,
	metodo_pago?: MetodoPago,
	precio_total?: number
}
