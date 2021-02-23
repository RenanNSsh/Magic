import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MagicGeneratorRoutingModule } from './magic-generator-routing.module';
import { MagicGeneratorComponent } from './page/magic-generator.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { JsonConverterService } from './services/json-converter.service';
import { DialogRelationshipComponent } from './components/dialog-relationship/dialog-relationship.component';
import { DialogInvalidJsonComponent } from './components/dialog-invalid-json/dialog-invalid-json.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [MagicGeneratorComponent, DialogRelationshipComponent, DialogInvalidJsonComponent],
  imports: [
    CommonModule,
    MagicGeneratorRoutingModule,
    SharedModule,
    HttpClientModule
  ],
  providers: [
    JsonConverterService
  ]
})
export class MagicGeneratorModule { }
