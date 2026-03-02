import { Persona } from "./persona";

export interface Auditoria {
    id_aud: number,
    accion: string,
    persona?: Persona
    fecha: Date,
    hora: string,
    datos_original: any | null;
    datos_nuevo: any | null;
}

