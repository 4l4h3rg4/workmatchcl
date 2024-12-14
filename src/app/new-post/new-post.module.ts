import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewPostPageRoutingModule } from './new-post-routing.module';
import { NewPostPage } from './new-post.page';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPostPageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí
  ],
  declarations: [NewPostPage]
})
export class NewPostPageModule {}
