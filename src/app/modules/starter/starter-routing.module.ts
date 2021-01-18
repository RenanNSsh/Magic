import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StarterComponent } from './page/starter/starter.component';


const routes: Routes = [{ path: '', component: StarterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StarterRoutingModule { }
