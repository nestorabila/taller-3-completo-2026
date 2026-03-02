import { Categoria } from "./categoria";
import { Empaque } from "./empaque";
import { Insumo } from "./insumo";
import { Producto } from "./producto";


export interface DetalleInsumo {
    iddetalle_compra?: number,
	  precio_u:  number,
	  precio_t:  number,
	  cantidad_u: number,
	  cantidad_e: number,
	  cantidad_t: number,
	  observacion: string,
      producto?: Producto,
      compra?: Insumo,
	  empaque?: Empaque,
	  idcompra?: number,
	
}
