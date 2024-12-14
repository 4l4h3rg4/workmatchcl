import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HistoriasComponent } from '../historias/historias.component';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí
  ],
  declarations: [HomePage, HistoriasComponent]
})
export class HomePageModule {}
