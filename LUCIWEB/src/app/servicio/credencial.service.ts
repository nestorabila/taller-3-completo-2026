import { Injectable } from '@angular/core';
import { Credencial } from '../model/credencial';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CredencialService {
  private apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { 
   
  }
  // Método de login
  iniciarSesion(usuario: string, contrasena: string): Observable<any> {
    const body = {
      usuario: usuario,
      contrasena: contrasena
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiURL}/login`, body, { headers });
  }
  // En tu CredencialService
getToken() {
  const token = localStorage.getItem('token'); 
 
  return token;
}
  getRol(): string | null {
    return localStorage.getItem('rol'); 
  }
  listarCredencial(): Observable<Credencial[]> {
    return this.http.get<Credencial[]>(this.apiURL + "/listarCredencial");
  }
  
  registrarCredencial(persona: Credencial): Observable<any> {
    return this.http.post<Credencial>(this.apiURL + "/registrarCredencial", persona);
  }

  modificarCredencial(persona: Credencial): Observable<any> {
    const modURL = this.apiURL + "/modificarCredencial/" + persona.usuario;
    return this.http.put<Credencial>(modURL, persona);
  }
  
}
