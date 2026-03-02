import { Proveedor } from "./proveedor";

export interface Insumo {
    idcompra?: number,
    fecha: Date,
    hora: string,
    precio_total?: number,
    cantidad_total?: number,
    proveedor?: Proveedor
}
