import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalleInsumo } from '../model/detalle-insumo';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DetalleInsumoService {

  private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarDetalleCompra(): Observable<DetalleInsumo[]> {
     return this.http.get<DetalleInsumo[]>(this.apiURL + "/listarDetalleCompra");
   }
  ListarDetalleCompraID(idcompra: number): Observable<DetalleInsumo[]> {
         return this.http.get<DetalleInsumo[]>(`${this.apiURL}/listarDetalleCompraID/${idcompra}`);
       } 
 
   RegistrarDetalleCompra(persona: DetalleInsumo): Observable<any> {
     return this.http.post<DetalleInsumo>(this.apiURL + "/registrarDetalleCompra", persona);
   }
ModificarDetalleCompra(persona: DetalleInsumo): Observable<any> {
    const modURL = this.apiURL + "/modificarDetalleCompra/" + persona.iddetalle_compra;
    return this.http.put<DetalleInsumo>(modURL, persona);
  }
   eliminarDetCompra(idlibre: number): Observable<any> {
      const deleteURL = this.apiURL + "/eliminarDetCompra/" + idlibre;
      return this.http.delete<any>(deleteURL);
    }
}
