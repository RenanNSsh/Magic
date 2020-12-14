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

  constructor(private jsonConverter: JsonConverterService) { }

  ngOnInit(): void {
  }

  toggleJsonMode(){
    this.jsonMode = !this.jsonMode;
  }

  generateJson(){
    const classConverted = this.jsonConverter.toJava(this.entityJson, this.entityName, this.entityBasePackage);
    this.entities.push({
      name: this.entityName
    })
    this.entityName = '';
    this.entityJson = '';
    this.entityBasePackage = 'br.com.exception';
  }

  removeEntity(entity){
    this.entities = this.entities.filter(entityList => entityList != entity);
  }

}
