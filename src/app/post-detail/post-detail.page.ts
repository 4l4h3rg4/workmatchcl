import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit {
  post: any;
  user: any;
  currentImageIndex: number = 0;
  isFollowing: boolean = false;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.currentUserId = user.uid;
        const postId = this.route.snapshot.paramMap.get('id');
        if (postId) {
          this.firestore.collection('posts').doc(postId).valueChanges().subscribe(post => {
            this.post = post;
            if (this.post?.userId) {
              this.loadUserData(this.post.userId);
              this.checkIfFollowing(this.post.userId);
            }
          });
        }
      }
    });
  }

  loadUserData(userId: string) {
    this.firestore.collection('users').doc(userId).valueChanges().subscribe(user => {
      this.user = user;
    });
  }

  checkIfFollowing(userId: string) {
    if (this.currentUserId) {
      this.firestore.collection('users').doc(this.currentUserId).collection('following').doc(userId).valueChanges().subscribe(doc => {
        this.isFollowing = !!doc;
      });
    }
  }

  toggleFollow() {
    if (this.currentUserId && this.post?.userId) {
      const followingRef = this.firestore.collection('users').doc(this.currentUserId).collection('following').doc(this.post.userId);
      const followersRef = this.firestore.collection('users').doc(this.post.userId).collection('followers').doc(this.currentUserId);

      if (this.isFollowing) {
        followingRef.delete().then(() => {
          followersRef.delete().then(() => {
            this.updateFollowerCount(this.post.userId, -1);
            this.isFollowing = false;
          }).catch(error => {
            console.error('Error al eliminar de seguidores:', error);
          });
        }).catch(error => {
          console.error('Error al dejar de seguir:', error);
        });
      } else {
        followingRef.set({ followedAt: new Date() }).then(() => {
          followersRef.set({ followedAt: new Date() }).then(() => {
            this.updateFollowerCount(this.post.userId, 1);
            this.isFollowing = true;
          }).catch(error => {
            console.error('Error al añadir a seguidores:', error);
          });
        }).catch(error => {
          console.error('Error al seguir:', error);
        });
      }
    }
  }

  updateFollowerCount(userId: string, change: number) {
    const userRef = this.firestore.collection('users').doc(userId);
    userRef.update({
      followersCount: firebase.firestore.FieldValue.increment(change)
    }).catch(error => {
      console.error('Error al actualizar el contador de seguidores:', error);
    });
  }

  nextImage() {
    if (this.post?.images && this.currentImageIndex < this.post.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  prevImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
}