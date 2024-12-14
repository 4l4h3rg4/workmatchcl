import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.checkFirebaseConnection();
    });
  }

  checkFirebaseConnection() {
    // Intenta acceder a Firestore
    this.firestore.collection('test').get().subscribe(
      () => {
        console.log('Conexión a Firebase (Firestore) establecida correctamente');
      },
      error => {
        console.error('Error al conectar con Firebase (Firestore):', error);
      }
    );

    // Verifica el estado de autenticación
    this.afAuth.authState.subscribe(
      user => {
        if (user) {
          console.log('Usuario autenticado en Firebase');
        } else {
          console.log('No hay usuario autenticado en Firebase');
        }
      },
      error => {
        console.error('Error al verificar el estado de autenticación:', error);
      }
    );
  }
}
