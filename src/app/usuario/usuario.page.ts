import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {
  contenidoActual: string = 'trabajos'; // Mostrar 'trabajos' por defecto
  userData: any = {}; // Objeto para almacenar los datos del usuario
  userPosts: any[] = []; // Array para almacenar los posts del usuario
  collaboratorPosts: any[] = []; // Array para almacenar los posts en los que el usuario es colaborador
  userId: string = ''; // ID del usuario
  currentImageIndex: number[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.userId = user.uid;
        this.loadUserData();
        this.loadUserPosts(this.userId);
        this.loadCollaboratorPosts(this.userId);
      }
    });
  }

  async loadUserData() {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userDoc = await this.firestore.collection('users').doc(user.uid).get().toPromise();
      if (userDoc && userDoc.exists) {
        this.userData = userDoc.data();
        this.userData.id = user.uid;
        this.userData.postsCount = this.userPosts.length;
        this.userData.collaborationsCount = this.collaboratorPosts.length;
      }
    }
  }
  

  async loadUserPosts(userId: string) {
    try {
      const userPostsSnapshot = await this.firestore.collection('posts', ref => ref.where('userId', '==', userId)).get().toPromise();
      const userPosts = userPostsSnapshot ? userPostsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...(data ? data : {}) }; // Asegúrate de que data es un objeto
      }) : [];
      this.userPosts = userPosts;
      this.userData.postsCount = userPosts.length; // Actualiza el contador de posts
      this.userPosts.forEach(() => this.currentImageIndex.push(0));
    } catch (error) {
      console.error('Error al cargar los posts del usuario:', error);
      this.userPosts = [];
    }
  }
  
  async loadCollaboratorPosts(userId: string) {
    try {
      const collaboratorPostsSnapshot = await this.firestore.collection('posts', ref => ref.where('collaborators', 'array-contains', userId)).get().toPromise();
      const collaboratorPosts = collaboratorPostsSnapshot ? collaboratorPostsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...(data ? data : {}) }; // Asegúrate de que data es un objeto
      }) : [];
      this.collaboratorPosts = collaboratorPosts;
      this.userData.collaborationsCount = collaboratorPosts.length; // Actualiza el contador de colaboraciones
      this.collaboratorPosts.forEach(() => this.currentImageIndex.push(0));
    } catch (error) {
      console.error('Error al cargar los posts en los que el usuario es colaborador:', error);
      this.collaboratorPosts = [];
    }
  }

  cambiarContenido(event: any) {
    this.contenidoActual = event.detail.value;
  }

  nextImage(postIndex: number) {
    const post = this.userPosts[postIndex];
    if (post.images && post.images.length > 1) {
      this.currentImageIndex[postIndex] = (this.currentImageIndex[postIndex] + 1) % post.images.length;
    }
  }

  async openEditProfileModal() {
    const modal = await this.modalController.create({
      component: EditProfileModalComponent,
      componentProps: { userData: { ...this.userData } }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.userData = data.data; // Actualiza los datos del usuario
      }
    });
  
    return await modal.present();
  }

  logout() {
    this.afAuth.signOut().then(() => {
      // Redirige al usuario a la página de inicio de sesión
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  openLink(type: string) {
    let url = '';
    switch (type) {
      case 'email':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.userData.email}`;
      break;
      case 'linkedin':
        url = this.userData.socialLinks.linkedin;
        break;
      case 'github':
        url = this.userData.socialLinks.github;
        break;
      default:
        console.warn('Tipo de enlace no soportado');
        return;
    }
    if (url) {
      window.open(url, '_blank');
    } else {
      console.warn('URL no disponible');
    }
  }

  verDetallePost(postId: string) {
    if (postId) {
      this.router.navigate(['/post-detail', postId]); // Navega a la página de detalles del post
    } else {
      console.error('El ID del post es undefined');
    }
  }
} 