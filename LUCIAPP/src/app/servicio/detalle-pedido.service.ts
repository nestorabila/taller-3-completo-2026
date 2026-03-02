import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetallePedido } from '../model/detalle-pedido';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class DetallePedidoService {
private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarDetallePedido(): Observable<DetallePedido[]> {
     return this.http.get<DetallePedido[]>(this.apiURL + "/listarDetallePedido");
   }
  ListarDetallePedidoID(idPedido: number): Observable<DetallePedido[]> {
         return this.http.get<DetallePedido[]>(`${this.apiURL}/listarDetallePedidoID/${idPedido}`);
       } 
 
   RegistrarDetallePedido(persona: DetallePedido): Observable<any> {
     return this.http.post<DetallePedido>(this.apiURL + "/registrarDetallePedido", persona);
   }
ModificarDetallePedido(persona: DetallePedido): Observable<any> {
    const modURL = this.apiURL + "/modificarDetallePedido/" + persona.iddetalle_pedido;
    return this.http.put<DetallePedido>(modURL, persona);
  }
   eliminarDetPedido(idlibre: number): Observable<any> {
      const deleteURL = this.apiURL + "/eliminarDetPedido/" + idlibre;
      return this.http.delete<any>(deleteURL);
    }
}
