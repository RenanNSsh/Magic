import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JsonConverterJava } from './json-converter-java';
import { EntityConvert } from '../models/entity-convert';
import { RelationshipField } from '../models/relationship';
import { JsonConverterAngular } from './json-converter-angular';
import { JsonConverterFlutter } from './json-converter-flutter';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  constructor(private http: HttpClient) { }

  convertApi(entities: EntityConvert[]){
    return this.http.post('http://localhost:3000/converter', entities)
  }
  
  convert(entities: EntityConvert[]){
    const zip = new JSZip();
    entities.forEach(entity => {
      const classConverted = this.toJava(entity.json, entity.name, entity.basePackage,entity.relationships, zip,entities);    
      this.toAngular(entity, entities, zip);
      this.toFlutter(entity, entities, zip,entity.appName);
    });
    console.log(zip.files);
    zip.generateAsync({type:"blob"})
       .then(function(content) {
            console.log(zip.files, zip);
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

  toFlutter(entity: EntityConvert, entities: EntityConvert[], zip: JSZip,appName: string){
    const flutterZip = zip.folder('flutter')
    this.generateFlutter(entity, entities,flutterZip,appName);
  }

  generateFlutter(entity: EntityConvert, entities: EntityConvert[], zip: JSZip, appName: string){
    const flutterConverter = new JsonConverterFlutter(this);
    flutterConverter.generate(entity, entities,zip,appName)
  }

  generateJava(json: string, name: string, basePackage: string,relationships: RelationshipField[], zip: JSZip,entities: EntityConvert[]){
    const javaConverter = new JsonConverterJava(this);
    javaConverter.generate(json, name, basePackage,relationships, zip,entities);

  }
}
