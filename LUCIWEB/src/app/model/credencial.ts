import { Persona } from "./persona";

export interface Credencial {
    usuario: string;
    contrasena: string;
    persona?: Persona
}
