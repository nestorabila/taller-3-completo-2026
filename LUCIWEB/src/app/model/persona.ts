import { Credencial } from "./credencial";
import { Genero } from "./genero";
import { Rol } from "./rol";

export interface Persona {
    idpersona: number;
	cedula: string
	 nombre: string;
	 ap_paterno: string;
	 ap_materno: string;
	 direccion: string;
	 telefono: number;
	 fotografia: string;
	 fecha: Date;
	 hora: string,
	 correo: string;
	 genero?: Genero
	 estado: number;
     rol?: Rol[];
	 credencial?: Credencial;
}
