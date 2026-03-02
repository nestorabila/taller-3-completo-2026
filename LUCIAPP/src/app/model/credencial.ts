import { Negocio } from "./negocio";
import { Persona } from "./persona";

export interface Credencial {
     usuario: string;
    contrasena: string;
    persona?: Persona;
    negocio?: Negocio;
}
