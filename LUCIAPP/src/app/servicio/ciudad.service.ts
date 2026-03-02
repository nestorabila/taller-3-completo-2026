import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ciudad } from '../model/ciudad';
import { Departamento } from '../model/departamento';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CiudadService {
 private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
  ListarDep(): Observable<Departamento[]> {
     return this.http.get<Departamento[]>(this.apiURL + "/listarDep");
   }

   ListarCuidad(): Observable<Ciudad[]> {
     return this.http.get<Ciudad[]>(this.apiURL + "/listarCiudad");
   }
   }

