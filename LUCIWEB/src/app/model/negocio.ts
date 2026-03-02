
import { Ciudad } from "./ciudad";
import { Persona } from "./persona";

export interface Negocio {
    idlibreria: number,
    nit : string,
    razon_social: string,
    direccion: string,
    estado: number,
    telefono: string,
    fecha: Date,
    hora: string, 
    codigo: string,
    persona?: Persona,
    ciudad?: Ciudad,

}
