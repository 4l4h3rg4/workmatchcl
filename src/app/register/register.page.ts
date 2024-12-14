import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  currentStep: number = 1;
  totalSteps: number = 3;
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  specialization: string = '';
  skillsUXUI: boolean = false;
  skillsBackend: boolean = false;
  skillsAppDesign: boolean = false;
  skillsBranding: boolean = false;
  skillsFrontend: boolean = false;
  skillsMotionGraphics: boolean = false;
  experienceYears: string = '';
  bio: string = '';
  portfolioType: string = '';
  socialLinks: any = {
    linkedin: '',
    github: ''
  };
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Valid(): boolean {
    return (
      this.name.trim() !== '' &&
      this.email.trim() !== '' &&
      this.password.trim() !== '' &&
      this.confirmPassword.trim() !== '' &&
      this.password === this.confirmPassword
    );
  }

  isStep2Valid(): boolean {
    return (
      this.specialization.trim() !== '' &&
      this.experienceYears.trim() !== ''
    );
  }

  isStep3Valid(): boolean {
    return this.bio.trim() !== '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        this.showAlert('Error', 'La foto de perfil es demasiado pesada. El tamaño máximo es de 2MB.');
        return;
      }
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          this.photoPreview = e.target.result as string | ArrayBuffer;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async submit() {
    if (!this.isStep1Valid()) {
      this.showAlert('Error', 'Por favor, completa todos los campos del paso 1.');
      return;
    }

    if (!this.isStep2Valid()) {
      this.showAlert('Error', 'Por favor, completa todos los campos del paso 2.');
      return;
    }

    if (!this.isStep3Valid()) {
      this.showAlert('Error', 'Por favor, completa todos los campos del paso 3.');
      return;
    }

    if (this.selectedFile && this.selectedFile.size > 2 * 1024 * 1024) {
      this.showAlert('Error', 'La foto de perfil es demasiado pesada. El tamaño máximo es de 2MB.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando...',
    });
    await loading.present();

    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      
      if (userCredential.user) {
        const userId = userCredential.user.uid;

        const defaultPhotoURL = 'src/assets/img/default-avatar.png';
        const photoURLToSave = this.photoPreview || defaultPhotoURL;

        try {
          await this.firestore.collection('users').doc(userId).set({
            name: this.name,
            email: this.email,
            specialization: this.specialization,
            skills: {
              UXUI: this.skillsUXUI,
              Backend: this.skillsBackend,
              AppDesign: this.skillsAppDesign,
              Branding: this.skillsBranding,
              Frontend: this.skillsFrontend,
              MotionGraphics: this.skillsMotionGraphics,
            },
            experienceYears: this.experienceYears,
            bio: this.bio,
            socialLinks: this.socialLinks,
            photoURL: photoURLToSave
          });

          this.showAlert('Éxito', 'Registro procesado con éxito.', [
            {
              text: 'Ir a Home',
              handler: () => this.router.navigate(['/home'])
            }
          ]);
        } catch (firestoreError) {
          // Si ocurre un error al guardar en Firestore, elimina el usuario de Firebase Authentication
          await userCredential.user.delete();
          this.showAlert('Error', 'Error al guardar los datos en la base de datos. Inténtalo de nuevo.');
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.showAlert('Error', 'Ya hay un usuario registrado con este correo.');
      } else if (error.code === 'auth/invalid-email') {
        this.showAlert('Error', 'El correo electrónico no es válido.');
      } else if (error.code === 'auth/weak-password') {
        this.showAlert('Error', 'La contraseña es demasiado débil.');
      } else {
        console.error('Error al registrar:', error);
        this.showAlert('Error', 'Error al registrar: ' + error.message);
      }
    } finally {
      loading.dismiss();
    }
  }

  async showAlert(header: string, message: string, buttons: any[] = ['OK']) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons
    });

    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}