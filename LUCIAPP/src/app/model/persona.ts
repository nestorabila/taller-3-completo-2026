import { Genero } from "./genero";
import { Rol } from "./rol";

export interface Persona {
    idpersona: number;
	cedula: string
	 nombre: string;
	 ap_paterno: string;
	 ap_materno: string;
	 direccion: string;
	 telefono: string;
	 fotografia: string;
	 fecha: Date;
	 hora: string,
	 correo: string;
	 genero?: Genero
	 estado: number;
     rol?: Rol;
}
