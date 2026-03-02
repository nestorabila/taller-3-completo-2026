import { Injectable } from '@angular/core';
import { Pedido } from '../model/pedido';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Negocio } from '../model/negocio';
import { environment } from '../../environments/environment';
import { Pago } from '../model/pago';
@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiURL = environment.apiUrl;
    
    constructor(private http: HttpClient) { }
  
    ListarPedido(): Observable<Pedido[]> {
      return this.http.get<Pedido[]>(this.apiURL + "/listarPedido");
    }
   
    ListarReportePedido(params?: any): Observable<Pedido[]> {
       return this.http.get<Pedido[]>(this.apiURL + "/listarReportePedido", { params });
     }

    //  aui llamar al nuevo metodo
    ObtenerPedidosProximos(): Observable<Pedido[]> {
  return this.http.get<Pedido[]>(this.apiURL + "/reportePedidosProximos");
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
  
     buscarPedidos(filtro: string): Observable<Pedido[]> {
       return this.http.get<Pedido[]>(`${this.apiURL}/buscarPedido?filtro=${filtro}`);
     }




     //aqui para abajo se usa pagos
      ListarPago(): Observable<Pago[]> {
      return this.http.get<Pago[]>(this.apiURL + "/listarPago");
    }
      RegistrarPago(Pedido: Pago): Observable<any> {
      return this.http.post<Pago>(this.apiURL + "/registrarPago", Pedido);
    }
      buscarPago(filtro: string): Observable<Pago[]> {
       return this.http.get<Pago[]>(`${this.apiURL}/buscarPago?filtro=${filtro}`);
     }
      cambiarEstadoPago( fall: Pago): Observable<any> {
             let url = this.apiURL + "/cambiarEstadoPago/"+ fall.idpago;  
             return this.http.put(url, fall);
         }

    ListarReportePago(params?: any): Observable<Pago[]> {
       return this.http.get<Pago[]>(this.apiURL + "/listarReportePago", { params });
     }
}
