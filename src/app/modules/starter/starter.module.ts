import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarterComponent } from './page/starter/starter.component';
import { StarterRoutingModule } from './starter-routing.module';
import { DescriptionComponent } from './components/description/description.component';
import { StarterGeneratorComponent } from './components/starter-generator/starter-generator.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GenerateIconButtonsComponent } from './components/generate-icon-buttons/generate-icon-buttons.component';
import { GenerateSpringFormComponent } from './components/generate-spring-form/generate-spring-form.component';
import { GenerateAngularFormComponent } from './components/generate-angular-form/generate-angular-form.component';
import { GenerateFlutterFormComponent } from './components/generate-flutter-form/generate-flutter-form.component';



@NgModule({
  declarations: [StarterComponent, DescriptionComponent, StarterGeneratorComponent, GenerateIconButtonsComponent, GenerateSpringFormComponent, GenerateAngularFormComponent, GenerateFlutterFormComponent],
  imports: [
    CommonModule,
    StarterRoutingModule,
    SharedModule
  ]
})
export class StarterModule { }
