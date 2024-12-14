import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const name = route.paramMap.get('name');
    return this.afAuth.authState.pipe(
      take(1),
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users', ref => ref.where('name', '==', name)).get().pipe(
            take(1),
            map(snapshot => {
              if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                if (userDoc.id === user.uid) {
                  this.router.navigate(['/usuario']);
                  return false;
                }
              }
              return true;
            })
          );
        }
        return [false];
      })
    );
  }
}