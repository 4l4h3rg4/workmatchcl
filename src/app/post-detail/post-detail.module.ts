import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PostDetailPageRoutingModule } from './post-detail-routing.module';
import { PostDetailPage } from './post-detail.page';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module'; // Asegúrate de importar el módulo compartido


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostDetailPageRoutingModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostDetailPage
      }
    ])
  ],
  declarations: [PostDetailPage]
})
export class PostDetailPageModule {}
