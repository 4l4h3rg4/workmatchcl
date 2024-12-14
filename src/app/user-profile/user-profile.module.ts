import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserProfilePageRoutingModule } from './user-profile-routing.module';

import { UserProfilePage } from './user-profile.page';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserProfilePageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí
  ],
  declarations: [UserProfilePage]
})
export class UserProfilePageModule {}
