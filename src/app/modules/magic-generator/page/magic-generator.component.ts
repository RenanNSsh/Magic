import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectField } from 'src/app/shared/models/select-field';
import { ValidadeJsonStatus } from 'src/app/shared/models/validation-json-status';
import { isArray } from 'util';
import { DialogInvalidJsonComponent } from '../components/dialog-invalid-json/dialog-invalid-json.component';
import { DialogRelationshipComponent } from '../components/dialog-relationship/dialog-relationship.component';
import { EntityConvert } from '../models/entity-convert';
import { EntityProperty } from '../models/entity-property';
import { EntityPropertyType } from '../models/entity-property-type';
import { Relationship, RelationshipField, RelationshipJSON } from '../models/relationship';
import { JsonConverterService } from '../services/json-converter.service';

@Component({
  selector: 'magic-generator',
  templateUrl: './magic-generator.component.html',
  styleUrls: ['./magic-generator.component.scss']
})
export class MagicGeneratorComponent implements OnInit {

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
  
  propertyTypes: SelectField<EntityPropertyType>[] = [ {
    label: 'String',
    value: EntityPropertyType.String
  }, {
    label:'Integer',
    value: EntityPropertyType.Integer
  }, {
    label:'Double', 
    value: EntityPropertyType.Double
  }, {
    label: 'DateTime',
    value: EntityPropertyType.DateTime
  }];

  currentProperty: EntityProperty = {
    name: 'id',
    type: EntityPropertyType.Integer
  };
  entityProperties: EntityProperty[] = [];



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
      this.relationshipFields = result;
      this.addJson();
    });
  }

  validateEntityForm(): boolean{
    return true;
  }

  validCurrentProperty(): boolean{
    return this.currentProperty && !!this.currentProperty.name && !!this.currentProperty.type;
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

  getObjectValue():EntityPropertyType {
    return EntityPropertyType.Object;
  }

  getListObjectValue(): EntityPropertyType{
    return EntityPropertyType.ListObject;
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
    this.resetEntity();
  }

  resetEntity(): void{
    this.entityName = '';
    this.entityJson = '';
    this.relationshipFields = [];
    this.entityProperties = [];
    this.currentProperty = {
      name: '',
      type: null
    };
  }

  validateEntity(): boolean{
    this.invalidFields = [];
    if(!this.entityName){
      this.showAlertInvalidJson();
      return false;
    }
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
    this.jsonConverter.convertApi(this.entities).subscribe(res => {
      console.log(res);
    });
  }

  removeEntity(entity){
    this.entities = this.entities.filter(entityList => entityList != entity);
  }

  addProperty(){
    this.entityProperties = [...this.entityProperties, this.currentProperty];
    this.currentProperty =  {
      name: '',
      type: null
    };
  }

  removeProperty(property: EntityProperty){
    this.entityProperties = this.entityProperties.filter(entityProperty => entityProperty != property);
  }

  addForm(){
    const entity = {};
    for(let property of this.entityProperties){
      entity[property.name] = this.getPropertyExample(property.type);
    }

    if(this.validCurrentProperty()){
      entity[this.currentProperty.name] = this.getPropertyExample(this.currentProperty.type);
    }

    this.entityJson = JSON.stringify(entity);
    this.addJson();
  }

  getPropertyExample(propertyType: EntityPropertyType): any{
    switch(propertyType){
      case EntityPropertyType.String:
        return 'example';
      case EntityPropertyType.Integer:
        return 1;
      case EntityPropertyType.Double:
        return 1.1;
      case EntityPropertyType.DateTime:
        return '2020-09-10T05:55:19.276Z';
      case EntityPropertyType.Object:
        return {
          id: 1
        };
      case EntityPropertyType.ListObject:
        return [{
          id: 1
        }];
    }
  }

}
