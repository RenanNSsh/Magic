import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MagicGeneratorComponent } from './page/magic-generator.component';


const routes: Routes = [{ path: '', component: MagicGeneratorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MagicGeneratorRoutingModule { }
