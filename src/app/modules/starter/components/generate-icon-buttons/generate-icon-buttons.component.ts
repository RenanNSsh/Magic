import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGenerateSelected } from '../../models/form-generate-selected';

@Component({
  selector: 'magic-generate-icon-buttons',
  templateUrl: './generate-icon-buttons.component.html',
  styleUrls: ['./generate-icon-buttons.component.scss']
})
export class GenerateIconButtonsComponent implements OnInit {

  @Output() buttonFormSelected: EventEmitter<FormGenerateSelected> = new EventEmitter();
  formSelected: FormGenerateSelected = FormGenerateSelected.Spring;

  constructor() { }

  ngOnInit(): void {
  }

  selectSpringForm(): void{
    this.buttonFormSelected.emit(FormGenerateSelected.Spring);
    this.formSelected = FormGenerateSelected.Spring;
  }
  
  selectAngularForm(): void{
    this.buttonFormSelected.emit(FormGenerateSelected.Angular);
    this.formSelected = FormGenerateSelected.Angular;
  }

  selectFlutterForm(): void{
    this.buttonFormSelected.emit(FormGenerateSelected.Flutter);
    this.formSelected = FormGenerateSelected.Flutter;
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

  

}
