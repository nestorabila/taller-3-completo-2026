import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Sistema } from 'src/app/model/sistema';
import { SistemaService } from 'src/app/servicio/sistema.service';
import * as L from 'leaflet';


@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.component.html',
   standalone: true,
    imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./ubicacion.component.scss'],
})
export class UbicacionComponent  implements OnInit {
listaUbicacion: Sistema[]=[];
private map: any;
  constructor(private ubiser: SistemaService) { }
    loading: boolean = false;
modelUbicacion() {
    this.loading = true;
    this.ubiser.ListarUbicacion().subscribe((fall) => {
      this.listaUbicacion = fall;
      this.loading = false;

      if (this.listaUbicacion.length > 0) {
        const lat = parseFloat(this.listaUbicacion[0].lat);
        const lng = parseFloat(this.listaUbicacion[0].long);
        this.initMap(lat, lng);
      } else {
      }
    });
  }

  initMap(lat: number, lng: number): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    this.map = L.map('map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map)
      .bindPopup('Ubicación "Creaciones Lucianita')
      .openPopup();
  }


  ngOnInit() {
    this.modelUbicacion();
  }

}
