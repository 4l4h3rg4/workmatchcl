import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {

  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToChats() {
    this.router.navigate(['/chats']);
  }

  navigateToUsuario() {
    this.router.navigate(['/usuario']);
  }

  navigateToBuscar() {
    this.router.navigate(['/buscar']);
  }

  navigateToNewPost() {
    this.router.navigate(['/new-post']);
  }
}