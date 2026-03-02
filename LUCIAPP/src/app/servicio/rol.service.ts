import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Rol } from '../model/rol';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RolService {
 private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarRol(): Observable<Rol[]> {
     return this.http.get<Rol[]>(this.apiURL + "/listarRol");
   }
}
