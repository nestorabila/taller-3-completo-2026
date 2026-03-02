import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empaque } from '../model/empaque';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EmpaqueService {

 
  private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarEmpaque(): Observable<Empaque[]> {
     return this.http.get<Empaque[]>(this.apiURL + "/listarEmpaque");
   }
 
  
}
