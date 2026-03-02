import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Credencial } from '../model/credencial';
import { environment } from '../../environments/environment';
import { PersonaService } from './persona.service';
import { NegocioService } from './negocio.service';

@Injectable({
  providedIn: 'root'
})
export class CredencialService {

 private apiURL = environment.apiUrl;
  constructor(
     private personaService: PersonaService,
    private negocioService: NegocioService,
    private http: HttpClient) { 
   
  }
  private credencialTemp: Credencial | null = null;

  registrarCredencial(credencial: Credencial): Observable<any> {
    this.credencialTemp = credencial;
    console.log("📌 Credencial almacenada temporalmente:", this.credencialTemp);

    // 🔑 Aquí liberamos los demás y luego enviamos credencial
    return this.personaService.liberarPersona()!.pipe(
      switchMap((personaCreada) => {
        console.log("✅ Persona registrada:", personaCreada);

        // actualizamos persona en negocio antes de liberarlo
        const negocioTemp = this.negocioService.getNegocioTemp();
        if (negocioTemp) {
          negocioTemp.persona = personaCreada;
        }

        return this.negocioService.liberarNegocio()!.pipe(
          switchMap((negocioCreado) => {
            console.log("✅ Negocio registrado:", negocioCreado);

            // ahora enlazamos persona+negocio a credencial
            if (this.credencialTemp) {
              this.credencialTemp.persona = personaCreada;
              this.credencialTemp.negocio = negocioCreado;
            }

            return this.http.post<Credencial>(this.apiURL + "/registrarCredencial", this.credencialTemp!);
          })
        );
      })
    );
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

  listarCredencial(): Observable<Credencial[]> {
    return this.http.get<Credencial[]>(this.apiURL + "/listarCredencial");
  }
  
  // registrarCredencial(persona: Credencial): Observable<any> {
  //   return this.http.post<Credencial>(this.apiURL + "/registrarCredencial", persona);
  // }


  modificarCredencial(persona: Credencial): Observable<any> {
    const modURL = this.apiURL + "/modificarCredencial/" + persona.usuario;
    return this.http.put<Credencial>(modURL, persona);
  }
  
}
