import { Ciudad } from "./ciudad";
export interface Sistema {
    telefono: string,
    direccion: string,
    long: string,
    lat: string,
    ciudad?: Ciudad,
}
