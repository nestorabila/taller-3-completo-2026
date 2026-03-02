import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedido } from '../model/pedido';
import { environment } from '../../environments/environment';
import { Factura } from '../model/factura';
@Injectable({
  providedIn: 'root'
})
export class DepedidoService {
private apiURL = environment.apiUrl;
    
    constructor(private http: HttpClient) { }
  
    ListarPedido(): Observable<Pedido[]> {
      return this.http.get<Pedido[]>(this.apiURL + "/listarPedido");
    }
  getFacturaPDF(idfactura: number): Observable<Blob> {
  return this.http.get(`${this.apiURL}/factura/${idfactura}/pdf`, {
    responseType: 'blob' 
  });
}
 ListarFactura(): Observable<Factura[]> {
     return this.http.get<Factura[]>(this.apiURL + "/listarFactura");
   }
    RegistrarPedido(Pedido: Pedido): Observable<any> {
      return this.http.post<Pedido>(this.apiURL + "/registrarPedido", Pedido);
    }
    ModificarPedido(Pedido: Pedido): Observable<any> {
        const modURL = this.apiURL + "/modificarPedido/" + Pedido.idpedido;
        return this.http.put<Pedido>(modURL, Pedido);
      }
  ListarPedidosFiltradas(filtro: string): Observable<Pedido[]> {
     return this.http.get<Pedido[]>(`${this.apiURL}/listarPedidoFiltradas?filtro=${filtro}`);
   }

    cambiarEstadoPedido( fall: Pedido): Observable<any> {
         let url = this.apiURL + "/cambiarEstadoPedido/"+ fall.idpedido;  
         return this.http.put(url, fall);
     }
     // metodo de buscar Pedido aqui:
     buscarPedidos(filtro: string): Observable<Pedido[]> {
       return this.http.get<Pedido[]>(`${this.apiURL}/buscarPedido?filtro=${filtro}`);
     }
}
