import { Ciudad } from "./ciudad";
export interface Sistema {
    idnegocio: number,
    telefono: string,
    direccion: string,
    long: number,
    lat: number,
    ciudad?: Ciudad,
}
