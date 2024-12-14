import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { HistoriasModule } from './historias/historias.module';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { StoriesService } from './services/stories.service';


// Importa los módulos de Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module'; // Asegúrate de que esta ruta sea correcta

@NgModule({
  declarations: [AppComponent, ImageModalComponent, EditProfileModalComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    SharedModule,
    FormsModule,
    // Inicializa Firebase con la configuración
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StoriesService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agrega esto para reconocer componentes de Ionic
})
export class AppModule {}