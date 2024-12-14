import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuarioPageRoutingModule } from './usuario-routing.module';
import { UsuarioPage } from './usuario.page';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí
  ],
  declarations: [UsuarioPage]
})
export class UsuarioPageModule {}