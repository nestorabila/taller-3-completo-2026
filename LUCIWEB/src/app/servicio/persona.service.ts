import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Persona } from '../model/persona';
import { environment } from '../../environments/environment';
import { Genero } from '../model/genero';
@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  GuardarFotografia(data: FormData): Observable<any> {
  return this.http.post<any>(this.apiURL +"/fotoPersona", data);
}
  ListarPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiURL + "/listarPersonas");
  }
   ListarGenero(): Observable<Genero[]> {
       return this.http.get<Genero[]>(this.apiURL + "/listarGenero");
     }

  ListarReportePersona(params?: any): Observable<Persona[]> {
  return this.http.get<Persona[]>(this.apiURL + "/listarReportePersona", { params });
}

  // llamar aqui
  ListarPersonasFiltradas(filtro: string): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiURL}/listarPersonasFiltradas?filtro=${filtro}`);
  }
  RegistrarPersona(persona: Persona): Observable<any> {
    return this.http.post<Persona>(this.apiURL + "/registrarPersona", persona);
  }

  ModificarPersona(persona: Persona): Observable<any> {
    const modURL = this.apiURL + "/modificarPersona/" + persona.idpersona;
    return this.http.put<Persona>(modURL, persona);
  }
     /*----------modficar persona estado ----*/
     cambiarEstadoPersona( fall: Persona): Observable<any> {
      let url = this.apiURL + "/cambiarEstadoPersona/"+ fall.idpersona;  
      return this.http.put(url, fall);
  }
  // metodo de buscar persona aqui:
  buscarPersonas(filtro: string): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiURL}/buscarPersonas?filtro=${filtro}`);
  }
   VerDetallesPersona(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/verDetallesPersona/${id}`);
  }
}
