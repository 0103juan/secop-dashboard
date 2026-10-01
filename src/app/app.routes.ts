import { Routes } from '@angular/router';
import { EntityPage } from './entity-page';
import { Home } from './home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'entidad/:nit', component: EntityPage },
  { path: '**', redirectTo: '' },
];
