import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Catalogo } from '../model/catalogo';
import { Tipo } from '../model/tipo';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
 private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarCatalogo(): Observable<Catalogo[]> {
     return this.http.get<Catalogo[]>(this.apiURL + "/listarCatalogo");
   }
 ListarTipoCatalogo(): Observable<Tipo[]> {
     return this.http.get<Tipo[]>(this.apiURL + "/listarCategoria");
   }
   filtrarPorDestacado(destacado: number): Observable<Catalogo[]> {
  return this.http.get<Catalogo[]>(this.apiURL + "/filtrarPorDestacado", {
    params: { destacado }
  });
}

filtrarPorTipo(idtipo: number): Observable<Catalogo[]> {
  return this.http.get<Catalogo[]>(this.apiURL + "/filtrarPorTipo", {
    params: { idtipo }
  });
}

   RegistrarCatalogo(persona: Catalogo): Observable<any> {
     return this.http.post<Catalogo>(this.apiURL + "/registrarCatalogo", persona);
   }
   SubirImagen(data: FormData): Observable<any> {
  return this.http.post<any>(this.apiURL +"/subirImagen", data);
}

 
   ModificarCatalogo(persona: Catalogo): Observable<any> {
     const modURL = this.apiURL + "/modificarCatalogo/" + persona.idcatalogo;
     return this.http.put<Catalogo>(modURL, persona);
   }
   buscarCatalogo(filtro: string): Observable<Catalogo[]> {
     return this.http.get<Catalogo[]>(`${this.apiURL}/buscarCatalogo?filtro=${filtro}`);
   }
  cambiarEstadoCatalogo( fall: Catalogo): Observable<any> {
         let url = this.apiURL + "/cambiarEstadoCatalogo/"+ fall.idcatalogo;  
         return this.http.put(url, fall);
     }
    ListarCategoria(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(this.apiURL + "/listarCategoria");
  }
 
}
