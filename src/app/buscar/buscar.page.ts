import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, combineLatest, Subject } from 'rxjs';
import { map, catchError, tap, debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

interface ResultadoBusqueda {
  tipo: 'usuario' | 'post';
  datos: any;
}

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {
  resultadosBusqueda: Observable<ResultadoBusqueda[]> = of([]);
  feedPosts: Observable<any[]>;
  cargando = false;
  error = '';
  terminoBusqueda = '';
  categoriaSeleccionada: string | null = null;
  resultadosBusquedaArray: ResultadoBusqueda[] = [];
  posts: any[] = [];

  private searchTerms = new Subject<string>();

  constructor(
    private firestore: AngularFirestore,
    private menuCtrl: MenuController,
    private router: Router
  ) {
    this.feedPosts = new Observable<any[]>();
    this.initializeSearch();
  }

  ngOnInit() {
    this.cargarTodosLosPosts();
  }

  cargarTodosLosPosts() {
    this.cargando = true;
    this.firestore.collection('posts').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { 
          id, 
          ...data,
          title: data.title || 'Sin título',
          description: data.description || 'Sin descripción',
          clientName: data.clientName || 'Usuario desconocido',
          category: data.category || 'Sin categoría',
          images: data.images || []
        };
      })),
      tap(posts => {
        console.log('Todos los posts cargados:', posts);
        this.posts = posts;
        this.cargando = false;
      }),
      catchError(err => {
        console.error('Error al cargar los posts:', err);
        this.error = 'Error al cargar los posts.';
        this.cargando = false;
        return of([]);
      })
    ).subscribe();
  }

  private normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  buscar(event: any) {
    const term = event.target.value.trim();
    this.searchTerms.next(term);
  }

  private initializeSearch() {
    this.resultadosBusqueda = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term === '') {
          return of([]);
        }
        this.cargando = true;
        this.error = '';
        return combineLatest([
          this.buscarUsuarios(this.normalizeText(term)),
          this.buscarPosts(this.normalizeText(term))
        ]).pipe(
          map(([usuarios, posts]) => {
            const resultados: ResultadoBusqueda[] = [
              ...usuarios.map(u => ({ tipo: 'usuario' as const, datos: u })),
              ...posts.map(p => ({ tipo: 'post' as const, datos: p }))
            ];
            return resultados;
          }),
          tap(() => {
            this.cargando = false;
          }),
          catchError(err => {
            this.error = 'Ocurrió un error en la búsqueda. Por favor, intenta de nuevo.';
            console.error('Error en la búsqueda:', err);
            this.cargando = false;
            return of([]);
          })
        );
      })
    );
  }

  private buscarUsuarios(searchTerm: string): Observable<any[]> {
    return this.firestore.collection('users').get().pipe(
      map(snapshot => snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .filter(user => this.normalizeText(user.name).includes(searchTerm))
      )
    );
  }

  private buscarPosts(searchTerm: string): Observable<any[]> {
    return this.firestore.collection('posts').get().pipe(
      map(snapshot => snapshot.docs
        .map(doc => {
          const data = doc.data() as any;
          return { 
            id: doc.id, 
            ...data,
            creatorName: data.clientName
          };
        })
        .filter(post => 
          this.normalizeText(post.title).includes(searchTerm) || 
          this.normalizeText(post.description).includes(searchTerm) || 
          this.normalizeText(post.clientName).includes(searchTerm)
        )
      )
    );
  }

  filtrarPorCategoria(categoria: string) {
    this.cargando = true;
    this.error = '';
    this.categoriaSeleccionada = categoria;

    const categoriaLowerCase = this.normalizeText(categoria);

    this.resultadosBusqueda = this.firestore.collection('posts').get().pipe(
      map(snapshot => snapshot.docs
        .map(doc => {
          const data = doc.data() as any;
          return { 
            id: doc.id, 
            ...data,
            creatorName: data.clientName || 'Usuario desconocido' // Añadimos el nombre del creador
          };
        })
        .filter(post => this.normalizeText(post.category) === categoriaLowerCase)
      ),
      map(posts => posts.map(p => ({ tipo: 'post' as const, datos: p }))),
      tap(results => {
        console.log('Resultados de filtrado por categoría:', results);
        this.cargando = false;
        this.menuCtrl.close();
      }),
      catchError(err => {
        this.error = 'Ocurrió un error al filtrar. Por favor, intenta de nuevo.';
        console.error('Error al filtrar por categoría:', err);
        this.cargando = false;
        return of([]);
      })
    );
  }

  limpiarFiltro() {
    this.categoriaSeleccionada = null;
    this.resultadosBusqueda = of([]);
  }

  async onItemClick(resultado: any) {
    if (resultado.tipo === 'usuario') {
      const userId = resultado.datos.id;
      if (userId) {
        try {
          const userDoc = await this.firestore.collection('users').doc(userId).get().toPromise();
          if (userDoc && userDoc.exists) {
            const userData = userDoc.data() as { name?: string }; // Define el tipo de userData
            console.log('Datos del usuario:', userData); // Verifica qué datos estás obteniendo
            const name = userData?.name;
            if (name) {
              this.router.navigate(['/user', name]);
            } else {
              console.error('El nombre no está definido');
            }
          } else {
            console.error('No se encontró el usuario con el ID:', userId);
          }
        } catch (error) {
          console.error('Error al obtener el nombre del usuario:', error);
        }
      } else {
        console.error('El ID del usuario no está definido');
      }
    } else if (resultado.tipo === 'post') {
      this.router.navigate(['/post-detail', resultado.datos.id]);
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
