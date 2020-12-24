import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JsonConverterJava } from './json-converter-java';


@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  constructor() { }

  
  convert(entities: any[]){
    const zip = new JSZip();
    entities.forEach(entity => {
      const classConverted = this.toJava(entity.json, entity.name, entity.basePackage, zip);    
    });

    zip.generateAsync({type:"blob"})
       .then(function(content) {
           saveAs(content, "exception.zip");
       });
  }

  toJava(json: string, name: string, basePackage: string, zip: JSZip){
    
    const javaZip = zip.folder('java')
    const javaConverter = new JsonConverterJava();
    javaConverter.generate(json, name, basePackage, javaZip);
  }
}
