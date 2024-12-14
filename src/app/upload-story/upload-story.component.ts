import { Component } from '@angular/core';
import { StoriesService, Story } from '../services/stories.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-upload-story',
  templateUrl: './upload-story.component.html',
  styleUrls: ['./upload-story.component.scss']
})
export class UploadStoryComponent {
  selectedImage: string | null = null;
  userId: string = '';
  userName: string = '';
  userAvatar: string = '';

  constructor(
    private storiesService: StoriesService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.firestore.collection('users').doc(this.userId).valueChanges().subscribe((userData: any) => {
          this.userName = userData.name;
          this.userAvatar = userData.photoURL;
        });
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  shareStory() {
    if (this.selectedImage) {
      const newStory: Story = {
        id: this.generateId(),
        userAvatar: this.userAvatar,
        userName: this.userName,
        imageUrl: this.selectedImage,
        duration: 5,
        viewed: false,
        expiration: Date.now() + 24 * 60 * 60 * 1000
      };

      this.storiesService.uploadStory(newStory).then(() => {
        console.log('Historia compartida:', newStory);
        this.modalController.dismiss();
      }).catch((error: any) => {
        console.error('Error al compartir la historia:', error);
      });
    } else {
      alert('Por favor, selecciona una imagen.');
    }
  }

  removeImage() {
    this.selectedImage = null;
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}