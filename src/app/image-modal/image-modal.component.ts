import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent {
  @Input() img: string = ''; // Asignar un valor predeterminado

  constructor(private modalController: ModalController) {}

  closeModal() {
    this.modalController.dismiss();
  }
}