import { Pedido } from "./pedido";
export interface Factura {
    idventa: number,
	fecha: Date,
	hora: string,
	qr: string,
	estado: number,
	pedido?: Pedido,
	
}