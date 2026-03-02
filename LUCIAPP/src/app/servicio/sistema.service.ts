import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sistema } from '../model/sistema';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SistemaService {
private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  ListarUbicacion(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.apiURL + "/listarSistemaDTO");
  }
 
}
