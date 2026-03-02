import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../model/categoria';
import { Producto } from '../model/producto';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

 private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }


// ListarSubID(idcategoria: number): Observable<Subcategoria[]> {
//       return this.http.get<Subcategoria[]>(`${this.apiURL}/listarSubID/${idcategoria}`);
//     }
  ListarCategoria(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiURL + "/listarCategoria");
  }


 
  RegistrarCategoria(Categoria: Categoria): Observable<any> {
    return this.http.post<Categoria>(this.apiURL + "/registrarCategoria", Categoria);
  }

 
  ModificarCategoria(Categoria: Categoria): Observable<any> {
    const modURL = this.apiURL + "/modificarCategoria/" + Categoria.idcategoria;
    return this.http.put<Categoria>(modURL, Categoria);
  }
 
  
   eliminarSubCategoria(idlibre: number): Observable<any> {
        const deleteURL = this.apiURL + "/eliminarSubCategoria/" + idlibre;
        return this.http.delete<any>(deleteURL);
      }
    eliminarCategoria(idlibre: number): Observable<any> {
        const deleteURL = this.apiURL + "/eliminarCategoria/" + idlibre;
        return this.http.delete<any>(deleteURL);
      }  
  // metodo de buscar Categoria aqui:
  buscarCategorias(filtro: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiURL}/buscarCategoria?filtro=${filtro}`);
  }
}