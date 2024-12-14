import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfilePage } from './user-profile.page';
import { UserProfileGuard } from '../guards/user-profile.guard'; // Asegúrate de importar el guard

const routes: Routes = [
  {
    path: '',
    component: UserProfilePage,
    canActivate: [UserProfileGuard] // Aplica el guard aquí
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfilePageRoutingModule {}
