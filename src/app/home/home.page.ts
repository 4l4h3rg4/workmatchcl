import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  posts: any[] = [];
  postsFiltrados: any[] = [];
  categoriaSeleccionada: string = 'todos';

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit() {
    this.postService.getPosts().subscribe(posts => {
      this.posts = posts;
      this.postsFiltrados = posts; // Inicialmente muestra todos los posts
    });
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'todos') {
      this.postsFiltrados = this.posts;
    } else {
      this.postsFiltrados = this.posts.filter(post => post.category.toLowerCase() === categoria.toLowerCase());
    }
  }

  verDetallePost(postId: string) {
    if (postId) {
      this.router.navigate(['/post-detail', postId]); // Navega a la página de detalles del post
    } else {
      console.error('El ID del post es undefined');
    }
  }
}
