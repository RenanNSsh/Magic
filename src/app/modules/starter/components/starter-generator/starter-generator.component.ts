import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGenerateSelected } from '../../models/form-generate-selected';

@Component({
  selector: 'magic-starter-generator',
  templateUrl: './starter-generator.component.html',
  styleUrls: ['./starter-generator.component.scss']
})
export class StarterGeneratorComponent implements OnInit {

  formSelected: FormGenerateSelected = FormGenerateSelected.Spring;
  
  
  constructor() { }
  
  ngOnInit(): void {
  }

  changeFormSelected(form: FormGenerateSelected): void{
    console.log(form);
    this.formSelected = form;
  }
  
  canShowSpringForm(): boolean{
    return this.formSelected == FormGenerateSelected.Spring;
  }

  canShowAngularForm(): boolean{
    return this.formSelected === FormGenerateSelected.Angular;
  }
  
  canShowFlutterForm(): boolean{
    return this.formSelected === FormGenerateSelected.Flutter;
  }


  generateStarter(): void{

  }

}
