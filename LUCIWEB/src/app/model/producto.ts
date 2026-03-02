import { Categoria } from "./categoria";

export interface Producto {
     idproducto: number,
        nombre: string,
        descripcion: string,
        fecha: Date,
        hora: string,
        categoria?: Categoria
}
