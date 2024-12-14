import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatsPageRoutingModule } from './chats-routing.module';
import { ChatsPage } from './chats.page';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatsPageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí
  ],
  declarations: [ChatsPage]
})
export class ChatsPageModule {}
