import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [],
})
export class HomePage {
    constructor(private router: Router) {
    
    setTimeout(() => {
      this.router.navigate(['/main/listar/catalogos']);
    },0); 
  }
}
