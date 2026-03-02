import { Ciudad } from "./ciudad";
import { Persona } from "./persona";

export interface Proveedor {
    idproveedor: number,
	  telefono: string,
	  nit: string,
	  razon_social: string,
	  direccion: string,
	  fecha: Date,
	  hora: string,
	  estado: number,
	  persona?: Persona,
	  ciudad?: Ciudad

}
