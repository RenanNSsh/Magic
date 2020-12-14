import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { JsonConverterJava } from './json-converter-java';


@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  constructor() { }

  


  toJava(json: string, name: string, basePackage: string){
    const zip = new JSZip();
    const javaConverter = new JsonConverterJava();
    javaConverter.generate(json, name, basePackage, zip);
    
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // Force down of the Zip file
        saveAs(content, "exception.zip");
    });
  }
}
