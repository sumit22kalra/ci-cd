import { Routes } from '@angular/router';
import {Home} from './pages/home/home';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.Home)
  }
];