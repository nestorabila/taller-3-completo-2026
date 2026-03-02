import { Injectable } from '@angular/core';
import { Producto } from '../model/producto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {

private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  ListarProducto(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiURL + "/listarProducto");
  }
    buscarProducto(filtro: string): Observable<Producto[]> {
      return this.http.get<Producto[]>(`${this.apiURL}/buscarProducto?filtro=${filtro}`);
    }

  RegistrarProducto(Producto: Producto): Observable<any> {
    return this.http.post<Producto>(this.apiURL + "/registrarProducto", Producto);
  }

 
   ModificarProducto(Producto: Producto): Observable<any> {
    const modURL = this.apiURL + "/modificarProducto/" + Producto.idproducto;
    return this.http.put<Producto>(modURL, Producto);
  }
  
  
   eliminarProducto(idlibre: number): Observable<any> {
        const deleteURL = this.apiURL + "/eliminarProducto/" + idlibre;
        return this.http.delete<any>(deleteURL);
      }

      filtrarProductocategoria(idcategoria: number): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.apiURL + "/filtrarCategoriaProducto", {
          params: { idcategoria }
        });
      }
        ListarProductoID(idcategoria: number): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiURL}/listarProdudctoID/${idcategoria}`);
      }
      
        ListarReporteProducto(params?: any): Observable<Producto[]> {
           return this.http.get<Producto[]>(this.apiURL + "/listarReporteProducto", { params });
         }
   
}