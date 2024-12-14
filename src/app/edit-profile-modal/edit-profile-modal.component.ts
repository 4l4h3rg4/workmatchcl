import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
})
export class EditProfileModalComponent {
  @Input() userData: any;

  workStyleAlert = {
    header: 'modalidad de trabajo',
    message: 'Seleccione solo una',
    translucent: true,
  };

  constructor(private modalController: ModalController, private firestore: AngularFirestore) {}

  dismiss() {
    this.modalController.dismiss(this.userData); // Pasa los datos actualizados si es necesario
  }

  save() {
    const userDocRef = this.firestore.collection('users').doc(this.userData.id);
  
    const updatedData = {
      name: this.userData.name || '',
      location: this.userData.location || '',
      workStyle: this.userData.workStyle || '',
      education: this.userData.education || '',
      languages: this.userData.languages || '',
      experience: this.userData.experience || '',
      email: this.userData.email || '',
      socialLinks: {
        linkedin: this.userData.socialLinks?.linkedin || '',
        github: this.userData.socialLinks?.github || ''
      },
      available: this.userData.available !== undefined ? this.userData.available : false
    };
  
    userDocRef.set(updatedData, { merge: true }).then(() => {
      this.dismiss(); // Cierra el modal sin pasar argumentos
    }).catch((error: any) => {
      console.error('Error al guardar los cambios:', error);
    });
  }
}