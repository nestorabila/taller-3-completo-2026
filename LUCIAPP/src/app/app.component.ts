import { Component } from '@angular/core';
import { Platform, IonApp, IonRouterOutlet, AlertController } from '@ionic/angular/standalone';
import { App as CapacitorApp } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
  standalone: true,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
  this.platform.ready().then(() => {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // Definimos las rutas raíz
      const rutaRaiz = ['/home', '/main/listar/catalogos'];
      const esRaiz = rutaRaiz.some(r => this.router.url.startsWith(r));

      if (!esRaiz) {
        // No estamos en la raíz, navegamos hacia atrás
        window.history.back();
      } else {
        // Página raíz: mostrar alerta para salir
        const alert = await this.alertCtrl.create({
          header: 'Salir',
          message: '¿Deseas salir de la app?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Salir',
              handler: () => CapacitorApp.exitApp(), // Cierra la app correctamente
            },
          ],
        });
        await alert.present();
      }
    });
  });
}
}
