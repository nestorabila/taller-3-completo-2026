import { Injectable } from '@angular/core';
import { MetodoPago } from '../model/metodo-pago';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

 private apiURL = environment.apiUrl;
    
    constructor(private http: HttpClient) { }
  
    ListarMetodoPago(): Observable<MetodoPago[]> {
      return this.http.get<MetodoPago[]>(this.apiURL + "/listarMetodo");
    }

   
   }
