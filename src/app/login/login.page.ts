import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private navCtrl: NavController
  ) {}

  async login() {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      if (result.user) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDocRef = this.firestore.collection('users').doc(result.user.uid);
        const userDocSnapshot = await userDocRef.get().toPromise();
        
        if (userDocSnapshot && userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          if (userData) {
            console.log('Inicio de sesión exitoso', userData);
            // Aquí puedes guardar los datos del usuario en el almacenamiento local si lo deseas
            // localStorage.setItem('user', JSON.stringify(userData));
            
            // Navegar a la página principal o dashboard
            this.navCtrl.navigateForward('/home');
          } else {
            console.error('El documento del usuario existe pero no tiene datos');
            alert('Error al obtener los datos del usuario. Por favor, contacta al soporte.');
          }
        } else {
          console.error('No se encontró el documento del usuario');
          alert('No se encontraron datos para este usuario. Por favor, contacta al soporte.');
        }
      } else {
        console.error('No se pudo obtener el usuario después de la autenticación');
        alert('Error en el inicio de sesión. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Error en el inicio de sesión. Por favor, verifica tus credenciales.');
    }
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }

  goToForgotPassword() {
    this.navCtrl.navigateForward('/forgot-password');
  }
}
