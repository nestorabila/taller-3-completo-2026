import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Proveedor } from '../model/proveedor';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  ListarProveedor(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiURL + "/listarProveedor");
  }
 
  RegistrarProveedor(Proveedor: Proveedor): Observable<any> {
    return this.http.post<Proveedor>(this.apiURL + "/registrarProveedor", Proveedor);
  }

  ModificarProveedor(Proveedor: Proveedor): Observable<any> {
    const modURL = this.apiURL + "/modificarProveedor/" + Proveedor.idproveedor;
    return this.http.put<Proveedor>(modURL, Proveedor);
  }
  
   eliminarProveedor(idlibre: number): Observable<any> {
        const deleteURL = this.apiURL + "/eliminarProveedor/" + idlibre;
        return this.http.delete<any>(deleteURL);
      }
  // metodo de buscar Proveedor aqui:
  buscarProveedor(filtro: string): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiURL}/buscarProveedor?filtro=${filtro}`);
  }
}