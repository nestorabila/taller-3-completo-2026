import { Ciudad } from "./ciudad";
import { Persona } from "./persona";

export interface Negocio {
    idlibreria: number,
    nit: string,
    razon_social: string,
    direccion: string,
    telefono: number,
    fecha: Date,
    hora: string,
    estado: number,
    codigo: string,
    persona?: Persona,
    ciudad?: Ciudad,
    idpersona?: number,
}

