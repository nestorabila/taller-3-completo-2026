import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Negocio } from '../model/negocio';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NegocioService {

  private apiURL = environment.apiUrl;
    
    constructor(private http: HttpClient) { }
  
     ListarNegocioCompleto(): Observable<Negocio[]> {
       return this.http.get<Negocio[]>(this.apiURL + "/listarNegocioCompleto");
     }

      ListarReporteNegocio(params?: any): Observable<Negocio[]> {
       return this.http.get<Negocio[]>(this.apiURL + "/listarReporteLibreria", { params });
     }
     
    ListarNegocio(idpersona: number): Observable<Negocio[]> {
      return this.http.get<Negocio[]>(`${this.apiURL}/listarNegocio/${idpersona}`);
    } 
    RegistrarNegocio(persona: Negocio): Observable<any> {
      return this.http.post<Negocio>(this.apiURL + "/registrarNegocio", persona);
    }
  
    ModificarNegocio(persona: Negocio): Observable<any> {
      const modURL = this.apiURL + "/modificarNegocio/" + persona.idlibreria;
      return this.http.put<Negocio>(modURL, persona);
    }
    
    eliminarNegocio(idlibre: number): Observable<any> {
      const deleteURL = this.apiURL + "/eliminarNegocio/" + idlibre;
      return this.http.delete<any>(deleteURL);
    }
     cambiarEstadoLibreria( fall: Negocio): Observable<any> {
             let url = this.apiURL + "/cambiarEstadoLibreria/"+ fall.idlibreria;  
             return this.http.put(url, fall);
         }

    reenviarCodigoLibreria(idlibreria: number): Observable<any> { return this.http.put(
    this.apiURL + '/reenviarCodigoLibreria/' + idlibreria,
    {}
     );
    }

}
