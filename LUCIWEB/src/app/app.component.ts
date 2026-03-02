import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CabeceraComponent } from './main/cabecera/cabecera.component';
import { MainComponent } from './main/main.component';


@Component({
    selector: 'app-root',
    imports: [CommonModule,RouterOutlet,
        HttpClientModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'LUCIWEB';
}
