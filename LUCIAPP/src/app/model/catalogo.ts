import { Tipo } from "./tipo";

export interface Catalogo {
     idcatalogo: number,
	  nombre: string,
	  descripcion: string,
	  fotografia: string,
	  precio: number,
	  destacado: number,
	  fecha: string,
	  hora: string,
	  estado: number,
	  categoria?: Tipo,
	  imgCargada?: boolean;
}
