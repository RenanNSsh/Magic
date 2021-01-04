import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ValidadeJsonStatus } from 'src/app/shared/models/validation-json-status';
import { isArray } from 'util';
import { DialogInvalidJsonComponent } from '../components/dialog-invalid-json/dialog-invalid-json.component';
import { DialogRelationshipComponent } from '../components/dialog-relationship/dialog-relationship.component';
import { EntityConvert } from '../models/entity-convert';
import { Relationship, RelationshipField, RelationshipJSON } from '../models/relationship';
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
  appName = '';
  entities: EntityConvert[] = [];
  displayedColumns: string[] = ['entity', 'actions'];
  invalidFields: string[] = [];
  relationshipFields: RelationshipField[] = []; 

  constructor(private jsonConverter: JsonConverterService, public dialog: MatDialog) { }

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

  showAlertRelationship(){
    console.log('informe o tipo de relacionamento')
    const dialogRef = this.dialog.open(DialogRelationshipComponent, {
      data: {invalidFields: this.invalidFields.map(fieldLabel => {
        return {
          label: fieldLabel,
          relationship: null
        }
      })}
    });

    dialogRef.afterClosed().subscribe((result: RelationshipField[]) => {
      console.log('The dialog was closed');
      this.relationshipFields = result;
      this.addJson();
    });
  }

  validateRelationshipJSON(): ValidadeJsonStatus{
    try{
      const jsonObj = JSON.parse(this.entityJson);
      const entries = Object.entries(jsonObj);
      let relationship = ValidadeJsonStatus.Validated;
      for(let entry of entries){
        const value = entry[1];
        const label = entry[0];
        if(value === null){
          this.invalidFields.push(label);
          return ValidadeJsonStatus.Invalidated;    
        }
        if(typeof value === 'object' && !Array.isArray(value)){
          this.invalidFields.push(label);
          relationship = ValidadeJsonStatus.RelationshipInvalidated;
        }
        if(Array.isArray(value) && !!value[0] && typeof value[0] == 'object'){
          this.invalidFields.push(label);
          relationship = ValidadeJsonStatus.RelationshipInvalidated;
        }
      }

      return relationship;

    }catch(error){
      console.log(error); 
      return ValidadeJsonStatus.Invalidated;
    }
  }

  showAlertInvalidJson(){
    
    const dialogRef = this.dialog.open(DialogInvalidJsonComponent, {
      data: {invalidFields: this.invalidFields}
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  addJson(): void{
   if(!this.validateEntity()){
    return;
   }
   this.entities =[...this.entities,{
      name: this.entityName,
      json: this.entityJson,
      basePackage: this.entityBasePackage,
      relationships: this.relationshipFields,
      appName: this.appName
    }];
    console.log(this.entities);
    this.resetEntity();
  }

  resetEntity(): void{
    this.entityName = '';
    this.entityJson = '';
    this.entityBasePackage = 'br.com.exception';
    this.relationshipFields = [];
  }

  validateEntity(): boolean{
    this.invalidFields = [];
    if(!this.relationshipFields.length){
      switch(this.validateRelationshipJSON()){
        case ValidadeJsonStatus.RelationshipInvalidated: 
          this.showAlertRelationship();
          return false;
        case ValidadeJsonStatus.Invalidated:
          this.showAlertInvalidJson();
          return false;
      }
    }
    return true;
  }

  generateJson(){
    this.jsonConverter.convert(this.entities);
  }

  removeEntity(entity){
    this.entities = this.entities.filter(entityList => entityList != entity);
  }

}
