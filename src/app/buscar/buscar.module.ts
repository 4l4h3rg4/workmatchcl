import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BuscarPageRoutingModule } from './buscar-routing.module';
import { BuscarPage } from './buscar.page';
import { SharedModule } from '../shared/shared.module'; // Importa el módulo compartido


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuscarPageRoutingModule,
    SharedModule // Asegúrate de importar el módulo compartido aquí

  ],
  declarations: [BuscarPage]
})
export class BuscarPageModule {}
