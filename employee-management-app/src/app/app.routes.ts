import { Routes } from '@angular/router';
 export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.Home)
  },
   {
    path: 'build-history',
    loadComponent: () =>
      import('./modules/cicd/build-history/build-history')
        .then(m => m.BuildHistory)
  }
];