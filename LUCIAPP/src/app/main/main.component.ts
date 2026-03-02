import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CabeceraComponent } from './cabecera/cabecera.component';
import { MenulateralComponent } from './menulateral/menulateral.component';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
    imports: [ CommonModule, RouterModule,CabeceraComponent, MenulateralComponent ],
})
export class MainComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
