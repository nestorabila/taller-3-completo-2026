import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.scss'],
    standalone: true,
  imports: [CommonModule,  RouterModule],
})
export class CabeceraComponent  implements OnInit {
// En tu componente Angular
burbujas: any[] = [];

ngOnInit() {
  const colores = [
    'rgba(248,113,113,0.5)', // rojo pastel
    'rgba(96,165,250,0.4)',  // azul pastel
    'rgba(52,211,153,0.5)',  // verde pastel
    'rgba(167,139,250,0.3)', // morado pastel
    'rgba(251,191,36,0.4)'   // amarillo pastel
  ];
  for (let i = 0; i < 45; i++) { // más burbujas
    this.burbujas.push({
      size: Math.floor(Math.random() * 45) + 8, // 8px a 33px
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: colores[Math.floor(Math.random() * colores.length)],
      delay: Math.random() * 10, // 0 a 10s
      duration: 15 + Math.random() * 10 // duración variable 15-25s
    });
  }
}



}
