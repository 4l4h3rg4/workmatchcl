import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  getCurrentUserFollowers(): Observable<string[]> {
    return from(this.afAuth.currentUser).pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection(`users/${user.uid}/followers`).valueChanges();
        } else {
          return of([]);
        }
      }),
      map(followers => followers.map((follower: any) => follower.followerId))
    );
  }

  getCurrentUserId(): Observable<string> {
    return from(this.afAuth.currentUser).pipe(
      map(user => user ? user.uid : '')
    );
  }
}