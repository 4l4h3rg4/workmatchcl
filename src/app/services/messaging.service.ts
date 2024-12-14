// src/app/services/messaging.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  seen: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  constructor(private firestore: AngularFirestore) {}

  getChats(userId: string): Observable<any[]> {
    return this.firestore.collection('chats', ref => ref.where('participants', 'array-contains', userId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any; // Asegúrate de que data sea un objeto
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getMessages(chatId: string): Observable<Message[]> {
    return this.firestore.collection(`chats/${chatId}/messages`, ref => ref.orderBy('timestamp'))
      .valueChanges() as Observable<Message[]>;
  }

  async getChatParticipants(chatId: string): Promise<any[]> {
    const chatDoc = await this.firestore.collection('chats').doc(chatId).get().toPromise();
    
    if (chatDoc && chatDoc.exists) {
      const chatData = chatDoc.data() as { participants: string[] };
      if (chatData && chatData.participants) {
        const users = await Promise.all(chatData.participants.map(async userId => {
          const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
          if (userDoc && userDoc.exists) {
            const userData = userDoc.data() as { name: string };return { id: userId, name: userData.name || 'Usuario' };
          }
          return { id: userId, name: 'Usuario' };
        }));
        return users;
      }
    }
    return [];
  }

  getUserProfile(userId: string): Promise<{ name: string, photoURL: string }> {
    return this.firestore.collection('users').doc(userId).get().toPromise().then(doc => {
      if (doc && doc.exists) {
        const data = doc.data() as { name: string, photoURL: string };
        return {
          name: data.name || 'Usuario',
          photoURL: data.photoURL || 'assets/img/default-avatar.jpg' // Usa una URL por defecto si no hay foto
        };
      }
      return { name: 'Usuario', photoURL: 'assets/img/default-avatar.jpg' };
    });
  }

  sendMessage(chatId: string, message: Message): Promise<void> {
    return this.firestore.collection(`chats/${chatId}/messages`).add(message).then(() => {});
  }

  createChat(userId1: string, userId2: string): Promise<string> {
    return this.firestore.collection('chats').add({
      participants: [userId1, userId2]
    }).then(docRef => docRef.id);
  }

  async createChatWithMessage(userId1: string, userId2: string): Promise<string> {
    try {
      const participantsKey = [userId1, userId2].sort().join('_'); // Crea una clave combinada
      const chatRef = await this.firestore.collection('chats').add({
        participants: [userId1, userId2],
        participantsKey // Almacena la clave combinada
      });
  
      console.log('Chat creado exitosamente');
      return chatRef.id;
    } catch (error) {
      console.error('Error al crear el chat:', error);
      throw error;
    }
  }

  async markMessagesAsSeen(chatId: string, userId: string): Promise<void> {
    const messagesRef = this.firestore.collection(`chats/${chatId}/messages`, ref => 
      ref.where('receiverId', '==', userId).where('seen', '==', false)
    );
  
    const snapshot = await messagesRef.get().toPromise();
    
    if (snapshot && !snapshot.empty) { // Verifica que snapshot no sea undefined y no esté vacío
      snapshot.forEach(doc => {
        doc.ref.update({ seen: true });
      });
    }
  }

  async findExistingChat(userId1: string, userId2: string): Promise<any> {
    const participantsKey = [userId1, userId2].sort().join('_'); // Crea la misma clave combinada
    const chatSnapshot = await this.firestore.collection('chats', ref =>
      ref.where('participantsKey', '==', participantsKey)
    ).get().toPromise();
  
    if (chatSnapshot && !chatSnapshot.empty) {
      const chatDoc = chatSnapshot.docs[0];
      const chatData = chatDoc.data();
      if (chatData && typeof chatData === 'object') { // Asegúrate de que chatData es un objeto
        return { id: chatDoc.id, ...chatData }; // Devuelve el primer chat encontrado
      }
    }
    return null;
  }
}