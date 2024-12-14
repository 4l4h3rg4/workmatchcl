import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private collectionName = 'posts';

  constructor(private firestore: AngularFirestore) {}

  createPost(postData: any): Promise<any> {
    return this.firestore.collection(this.collectionName).add(postData);
  }

  getPosts(): Observable<any[]> {
    return this.firestore.collection(this.collectionName).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
}