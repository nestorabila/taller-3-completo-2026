import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sistema } from '../model/sistema';
import { environment } from '../../environments/environment';
import { Auditoria } from '../model/auditoria';
@Injectable({
  providedIn: 'root'
})
export class SistemaService {

private apiURL = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  ListarSistema(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.apiURL + "/listarSistema");
  }
 ListarAuditoria(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(this.apiURL + "/listaAuditoria");
  }

  ModificarSistema(Sistema: Sistema): Observable<any> {
    const modURL = this.apiURL + "/modificarSistema/" + Sistema.idnegocio;
    return this.http.put<Sistema>(modURL, Sistema);
  }
  
 
}