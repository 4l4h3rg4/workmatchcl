import { Component } from '@angular/core';
import { PostService } from '../post.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage {
  currentStep: number = 1;
  selectedImages: string[] = [];
  postTitle: string = '';
  postDescription: string = '';
  selectedCategory: string = '';
  newSkill: string = '';
  skills: string[] = [];
  clientName: string = '';
  projectLink: string = '';
  privacy: string = 'publico';
  collaborators: string[] = []; // Solo IDs
  collaboratorNames: { name: string; uid: string }[] = []; // Para mostrar nombres
  collaboratorInput: string = '';
  suggestions: any[] = [];
  categories: string[] = ['Fotografía', 'Diseño Web', 'Diseño Gráfico', 'Diseño de Aplicación', 'Programación'];

  constructor(
    private postService: PostService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {}

  async openImageModal(img: string) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      componentProps: { img }
    });
    return await modal.present();
  }

  nextStep() {
    if (this.currentStep < 2) {
      this.currentStep++;
    } else {
      this.submitPost();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length + this.selectedImages.length > 10) {
      alert('Puedes subir un máximo de 10 imágenes.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImages.push(e.target.result);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  addSkill() {
    if (this.newSkill.trim()) {
      this.skills.push(this.newSkill.trim());
      this.newSkill = '';
    }
  }

  async submitPost() {
    if (!this.postTitle.trim()) {
      this.showAlert('Error', 'El título es obligatorio.');
      return;
    }
  
    const loading = await this.loadingController.create({
      message: 'Publicando...',
    });
    await loading.present();
  
    try {
      const user = await this.afAuth.currentUser;
      if (user) {
        const postData = {
          userId: user.uid,
          title: this.postTitle.trim(),
          description: this.postDescription.trim(),
          category: this.selectedCategory || '',
          skills: this.skills || [],
          clientName: this.clientName.trim() || '',
          projectLink: this.projectLink.trim() || '',
          privacy: this.privacy || 'publico',
          collaborators: this.collaborators || [],
          images: this.selectedImages || []
        };
  
        // Verifica que todos los campos sean válidos
        console.log('Datos del post:', postData);
  
        await this.postService.createPost(postData);
        this.showAlert('Éxito', 'Post publicado con éxito.', [
          {
            text: 'Ir a Home',
            handler: () => this.router.navigate(['/home'])
          }
        ]);
      }
    } catch (error: any) {
      this.showAlert('Error', 'Error al publicar el post: ' + (error.message || error));
    } finally {
      loading.dismiss();
    }
  }

  onCollaboratorInput(event: any) {
    const inputValue = event.target.value;
    if (inputValue.includes('@')) {
      const query = inputValue.split('@').pop();
      this.searchUsers(query);
    } else {
      this.suggestions = [];
    }
  }
  
  searchUsers(query: string) {
    this.firestore.collection('users', ref => ref.where('name', '>=', query).where('name', '<=', query + '\uf8ff'))
      .get().toPromise().then(snapshot => {
        if (snapshot) {
          this.suggestions = snapshot.docs.map(doc => {
            const data = doc.data() as any; // Asegúrate de que sea tratado como un objeto
            return { ...data, uid: doc.id };
          });
        } else {
          this.suggestions = [];
        }
      });
  }

  selectCollaborator(user: any) {
    if (user && user.uid && !this.collaborators.includes(user.uid)) {
      this.collaborators.push(user.uid); // Guarda solo el ID
      this.collaboratorNames.push({ name: user.name, uid: user.uid }); // Guarda el nombre para mostrar
    }
    this.collaboratorInput = '';
    this.suggestions = [];
  }

  removeCollaborator(uid: string) {
    const index = this.collaborators.indexOf(uid);
    if (index > -1) {
      this.collaborators.splice(index, 1);
      this.collaboratorNames.splice(index, 1);
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
}
