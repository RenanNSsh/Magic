import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JsonConverterJava } from './json-converter-java';
import { EntityConvert } from '../models/entity-convert';
import { RelationshipField } from '../models/relationship';
import { JsonConverterAngular } from './json-converter-angular';


@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  constructor() { }

  
  convert(entities: EntityConvert[]){
    const zip = new JSZip();
    entities.forEach(entity => {
      const classConverted = this.toJava(entity.json, entity.name, entity.basePackage,entity.relationships, zip,entities);    
      this.toAngular(entity, entities, zip);
    });

    zip.generateAsync({type:"blob"})
       .then(function(content) {
           saveAs(content, "exception.zip");
       });
  }

  toJava(json: string, name: string, basePackage: string,relationships: RelationshipField[], zip: JSZip,entities: EntityConvert[]){
    
    const javaZip = zip.folder('java')
    this.generateJava(json, name, basePackage,relationships, javaZip,entities)
  }

  toAngular(entity: EntityConvert, entities: EntityConvert[], zip: JSZip){
    const angularZip = zip.folder('angular')
    this.generateAngular(entity, entities,angularZip);
  }

  generateAngular(entity: EntityConvert, entities: EntityConvert[], zip: JSZip){
    const angularConverter = new JsonConverterAngular(this);
    angularConverter.generate(entity, entities,zip)

  }

  generateJava(json: string, name: string, basePackage: string,relationships: RelationshipField[], zip: JSZip,entities: EntityConvert[]){
    const javaConverter = new JsonConverterJava(this);
    javaConverter.generate(json, name, basePackage,relationships, zip,entities);

  }
}
