import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'magic-generator', pathMatch: 'full' },
  { path: '', component: ContentLayoutComponent, children: [
    { path: 'magic-generator', loadChildren: () => import('./modules/magic-generator/magic-generator.module').then(m => m.MagicGeneratorModule) },
    { path: 'starter', loadChildren: () => import('./modules/starter/starter.module').then(m => m.StarterModule) }
  ] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
