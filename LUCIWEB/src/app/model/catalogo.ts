import { Categoria } from "./categoria";

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
	  categoria?: Categoria,
	  imgCargada?: boolean;
}
