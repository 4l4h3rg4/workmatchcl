import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'; // Importa firebase
import { MessagingService } from '../services/messaging.service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  userId: string = ''; // Inicializa como cadena vacía
  userData: any = {};
  contenidoActual: string = 'trabajos'; // Inicializa con un valor por defecto
  userPosts: any[] = []; // Inicializa como un array vacío
  currentImageIndex: number[] = []; // Inicializa como un array vacío
  collaboratorPosts: any[] = []; // Inicializa como un array vacío
  isFollowing: boolean = false; // iniciar sin seguir al usuario


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private messagingService: MessagingService

  ) {}

  ngOnInit() {
    const name = this.route.snapshot.paramMap.get('name');
    if (name) {
      this.afAuth.currentUser.then(currentUser => {
        if (currentUser) {
          this.firestore.collection('users', ref => ref.where('name', '==', name)).get().toPromise().then(userSnapshot => {
            if (userSnapshot && !userSnapshot.empty) {
              const userDoc = userSnapshot.docs[0];
              this.userData = userDoc.data();
              this.userData.id = userDoc.id;

              // Redirige al perfil personal si el usuario está viendo su propio perfil
              if (this.userData.id === currentUser.uid) {
                this.router.navigate(['/usuario']);
              } else {
                this.loadUserPosts(this.userData.id);
                this.loadCollaboratorPosts(this.userData.id);
                this.checkIfFollowing();
              }
            } else {
              console.error('No se encontraron datos para el usuario:', name);
            }
          }).catch(error => {
            console.error('Error al cargar los datos del usuario:', error);
          });
        }
      });
    } else {
      console.error('No se encontró el nombre de usuario en la ruta');
    }
  }

  async loadUserData(name: string) {
    try {
      const userSnapshot = await this.firestore.collection('users', ref => ref.where('name', '==', name)).get().toPromise();
      if (userSnapshot && !userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        this.userData = userDoc.data();
        this.userData.id = userDoc.id; // Asegúrate de asignar el ID
        this.loadUserPosts(this.userData.id); // Carga los posts después de obtener el ID
        this.loadCollaboratorPosts(this.userData.id); // Carga las colaboraciones después de obtener el ID
        this.checkIfFollowing();
      } else {
        console.error('No se encontraron datos para el usuario:', name);
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  async checkIfFollowing() {
    const currentUser = await this.afAuth.currentUser;
    if (currentUser) {
      const followerDoc = await this.firestore.collection('users').doc(this.userData.id).collection('followers').doc(currentUser.uid).get().toPromise();
      if (followerDoc && followerDoc.exists) { // Verifica que followerDoc no sea undefined
        this.isFollowing = true;
      } else {
        this.isFollowing = false;
      }
    }
  }

  async toggleFollow() {
    const currentUser = await this.afAuth.currentUser;
    if (currentUser) {
      const followerRef = this.firestore.collection('users').doc(this.userData.id).collection('followers').doc(currentUser.uid);
      const currentUserRef = this.firestore.collection('users').doc(currentUser.uid);

      if (this.isFollowing) {
        await followerRef.delete();
        this.userData.followersCount = (this.userData.followersCount || 0) - 1;
        await currentUserRef.update({
          followingCount: firebase.firestore.FieldValue.increment(-1) // Usa firebase.firestore.FieldValue
        });
      } else {
        await followerRef.set({ followedAt: new Date() });
        this.userData.followersCount = (this.userData.followersCount || 0) + 1;
        await currentUserRef.update({
          followingCount: firebase.firestore.FieldValue.increment(1) // Usa firebase.firestore.FieldValue
        });
      }
      this.isFollowing = !this.isFollowing;
      await this.firestore.collection('users').doc(this.userData.id).update({ followersCount: this.userData.followersCount });
    }
  }

  async startChat() {
    const currentUser = await this.afAuth.currentUser;
    if (currentUser && this.userData.id !== currentUser.uid) {
      try {
        const existingChat = await this.messagingService.findExistingChat(currentUser.uid, this.userData.id);
        if (existingChat) {
          this.router.navigate(['/chats', existingChat.id]);
        } else {
          const chatId = await this.messagingService.createChat(currentUser.uid, this.userData.id);
          if (chatId) {
            this.router.navigate(['/chats', chatId]);
          } else {
            console.error('No se pudo obtener el chatId');
          }
        }
      } catch (error) {
        console.error('Error al iniciar el chat:', error);
      }
    } else {
      console.warn('No puedes iniciar un chat contigo mismo.');
    }
  }

  async loadUserPosts(userId: string) {
    try {
      const userPostsSnapshot = await this.firestore.collection('posts', ref => ref.where('userId', '==', userId)).get().toPromise();
      const userPosts = userPostsSnapshot ? userPostsSnapshot.docs.map(doc => doc.data()) : [];
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
      const collaboratorPosts = collaboratorPostsSnapshot ? collaboratorPostsSnapshot.docs.map(doc => doc.data()) : [];
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
}
