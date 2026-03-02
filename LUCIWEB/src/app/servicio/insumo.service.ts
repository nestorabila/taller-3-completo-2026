import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Insumo } from '../model/insumo';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class InsumoService {

   private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarCompra(): Observable<Insumo[]> {
     return this.http.get<Insumo[]>(this.apiURL + "/listarCompra");
   }
   GraficarCompras(periodo: 'dia' | 'mes' = 'mes'): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiURL}/graficoCompras`, {
    params: { periodo }
  });
}

   ListarReporteCompra(params?: any): Observable<Insumo[]> {
          return this.http.get<Insumo[]>(this.apiURL + "/reporteCompras", { params });
        }
 
   RegistrarCompra(persona: Insumo): Observable<any> {
     return this.http.post<Insumo>(this.apiURL + "/registrarCompra", persona);
   }
   ModificarCompra(persona: Insumo): Observable<any> {
       const modURL = this.apiURL + "/modificarCompra/" + persona.idcompra;
       return this.http.put<Insumo>(modURL, persona);
     }
}
