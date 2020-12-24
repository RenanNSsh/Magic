import { Component, OnInit } from '@angular/core';
import { JsonConverterService } from '../services/json-converter.service';

@Component({
  selector: 'magic-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  jsonMode = false;
  formMode = false;
  entityName = '';
  entityJson = '';
  entityBasePackage = 'br.com.exception';
  entities = [];
  displayedColumns: string[] = ['entity', 'actions'];

  constructor(private jsonConverter: JsonConverterService) { }

  ngOnInit(): void {
  }
  
  showJsonMode(){
    this.jsonMode = true;
    this.formMode = false;
  }
  showFormMode(){
    this.formMode = true;
    this.jsonMode = false;
  }

  toggleJsonMode(){
    this.jsonMode = !this.jsonMode;
  }

  addJson(){
   this.entities =[...this.entities,{
      name: this.entityName,
      json: this.entityJson,
      basePackage: this.entityBasePackage
    }];
    this.entityName = '';
    this.entityJson = '';
    this.entityBasePackage = 'br.com.exception';
  }

  generateJson(){
    this.jsonConverter.convert(this.entities);
  }

  removeEntity(entity){
    this.entities = this.entities.filter(entityList => entityList != entity);
  }

}
