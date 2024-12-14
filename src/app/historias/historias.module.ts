import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoriasComponent } from './historias.component';
import { StoryViewerComponent } from './story-viewer/story-viewer.component';
import { UploadStoryComponent } from '../upload-story/upload-story.component';


@NgModule({
  declarations: [StoryViewerComponent, UploadStoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule // Asegúrate de importar IonicModule
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HistoriasModule {}