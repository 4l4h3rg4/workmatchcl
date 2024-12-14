import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'chats', loadChildren: () => import('./chats/chats.module').then(m => m.ChatsPageModule) },
  { path: 'chats/:chatId', loadChildren: () => import('./chats/chats.module').then(m => m.ChatsPageModule) }, // Añade esta línea
  { path: 'usuario', loadChildren: () => import('./usuario/usuario.module').then(m => m.UsuarioPageModule) },
  { path: 'buscar', loadChildren: () => import('./buscar/buscar.module').then(m => m.BuscarPageModule) },
  {
    path: 'new-post',
    loadChildren: () => import('./new-post/new-post.module').then( m => m.NewPostPageModule)
  }, 
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule) },
  {
    path: 'user-profile',
    loadChildren: () => import('./user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'user/:name', // Cambia 'userId' a 'username'
    loadChildren: () => import('./user-profile/user-profile.module').then(m => m.UserProfilePageModule)
  },
  {
    path: 'post-detail',
    loadChildren: () => import('./post-detail/post-detail.module').then( m => m.PostDetailPageModule)
  },
  {
    path: 'post-detail/:id',
    loadChildren: () => import('./post-detail/post-detail.module').then( m => m.PostDetailPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
