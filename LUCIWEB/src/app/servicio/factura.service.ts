import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Factura } from '../model/factura';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

 private apiURL = environment.apiUrl;
   
   constructor(private http: HttpClient) { }
 
   ListarFactura(): Observable<Factura[]> {
     return this.http.get<Factura[]>(this.apiURL + "/listarFactura");
   }
    ListarReporteFactura(params?: any): Observable<Factura[]> {
     return this.http.get<Factura[]>(this.apiURL + "/listarReporteFactura", { params });
   }
 RegistrarFactura(Factura: Factura): Observable<any> {
    return this.http.post<Factura>(this.apiURL + "/registrarFactura", Factura);
  }
  // FacturaService.ts
getFacturaPDF(idventa: number): Observable<Blob> {
  return this.http.get(`${this.apiURL}/factura/${idventa}/pdf`, {
    responseType: 'blob' 
  });
}

AnularFactura(idventa: number): Observable<any> {
    const url = `${this.apiURL}/anularFactura/${idventa}`;
    return this.http.put<any>(url, { estado: 0 }); // enviamos solo el nuevo estado
}

  // metodo de buscar Factura aqui:
  buscarFactura(filtro: string): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiURL}/buscarFactura?filtro=${filtro}`);
  }


}