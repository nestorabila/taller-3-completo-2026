import { Departamento } from "./departamento";

export interface Ciudad {
    idciudad: number,
    nombre: string,
    departamento?: Departamento
}
