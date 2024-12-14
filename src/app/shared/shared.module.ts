import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular'; // Importa IonicModule
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [FooterComponent],
  imports: [
    CommonModule,
    IonicModule // Asegúrate de importar IonicModule aquí
  ],
  exports: [FooterComponent] // Asegúrate de exportar el componente
})
export class SharedModule {}
