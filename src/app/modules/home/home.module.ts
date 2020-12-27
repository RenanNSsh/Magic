import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './page/home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { JsonConverterService } from './services/json-converter.service';
import { DialogRelationshipComponent } from './components/dialog-relationship/dialog-relationship.component';
import { DialogInvalidJsonComponent } from './components/dialog-invalid-json/dialog-invalid-json.component';


@NgModule({
  declarations: [HomeComponent, DialogRelationshipComponent, DialogInvalidJsonComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
  ],
  providers: [
    JsonConverterService
  ]
})
export class HomeModule { }
