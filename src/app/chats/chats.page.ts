import { Component, OnInit } from '@angular/core';
import { MessagingService, Message } from '../services/messaging.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {
  chats: any[] = [];
  selectedChat: any = null;
  newMessage: string = '';
  chatId: string = '';
  currentUserId: string = ''; // Define la propiedad

  constructor(
    private messagingService: MessagingService,
    private afAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.messagingService.getChats(user.uid).subscribe(chats => {
          this.chats = chats.map(chat => {
            const otherParticipant = chat.participants.find((id: string) => id !== user.uid);
            return this.messagingService.getUserProfile(otherParticipant).then(profile => {
              return { ...chat, otherParticipantName: profile.name, photoURL: profile.photoURL };
            });
          });
          Promise.all(this.chats).then(chatsWithProfiles => {
            this.chats = chatsWithProfiles;
          });
        });
      }
    });
  }

  openChatById(chatId: string) {
    this.messagingService.getMessages(chatId).subscribe((messages: Message[]) => {
      this.selectedChat = { id: chatId, messages: [], participants: [] };
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.messagingService.markMessagesAsSeen(chatId, user.uid);
          this.messagingService.getChatParticipants(chatId).then((participants: any[]) => {
            this.selectedChat.participants = participants;
            this.selectedChat.otherParticipant = participants.find(p => p.id !== user.uid)?.name || 'Usuario';
          }).catch(error => {
            console.error('Error al obtener los participantes del chat:', error);
          });

          // Convertir el timestamp de cada mensaje a Date si es un Timestamp
          this.selectedChat.messages = messages.map(message => {
            return {
              ...message,
              timestamp: message.timestamp instanceof Timestamp ? message.timestamp.toDate() : message.timestamp
            };
          });
        }
      });
    });
  }

  closeChat() {
    this.selectedChat = null;
  }

  sendMessage() {
    if (this.newMessage.trim() !== '' && this.selectedChat) {
      this.afAuth.currentUser.then(currentUser => {
        if (currentUser) {
          const message: Message = {
            senderId: currentUser.uid,
            receiverId: this.selectedChat.participants.find((id: string) => id !== currentUser.uid),
            content: this.newMessage,
            timestamp: new Date(), // Usa Date aquí
            seen: false
          };
          this.messagingService.sendMessage(this.selectedChat.id, message).then(() => {
            this.newMessage = '';
          }).catch(error => {
            console.error('Error al enviar el mensaje:', error);
          });
        }
      }).catch(error => {
        console.error('Error al obtener el usuario actual:', error);
      });
    }
  }
}