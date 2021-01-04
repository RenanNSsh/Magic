import * as JSZip from 'jszip';
import { EntityConvert } from '../models/entity-convert';
import { JsonConverterService } from './json-converter.service';

export class JsonConverterAngular{

    private indentation = '  ';
    private entity: EntityConvert;
    private entities: EntityConvert[];
    private name: string;
    private zip: JSZip;
    private imports: string;

    constructor(private jsonConverter: JsonConverterService){

    }

    public generate(entity: EntityConvert, entities: EntityConvert[], zip: JSZip){
        this.entity = entity;
        this.entities = entities;
        this.zip = zip;
        this.name = entity.name[0].toUpperCase() + entity.name.slice(1) + 'Model';

        this.generateModel();
        this.generateService();
    }
    
    private generateModel(){

        this.generateModelImports();
        const modelBody = this.generateModelBody();
        this.generateExternalModels();

        const folder = 'models';
        const modelsFolder = this.zip.folder(folder);
        const fileModelName = this.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
        modelsFolder.file(`${fileModelName}.ts`,this.imports+modelBody);
    }

    private generateService(){
        
        this.generateServiceImports();

        const serviceBody = this.generateServiceBody();

        const folder = 'services';
        const servicesFolder = this.zip.folder(folder);
        const fileName = this.name.replace('Model','.service')
                                       .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

        servicesFolder.file(`${fileName}.ts`,this.imports+serviceBody);
    }

    private generateServiceImports(){
        const fileModelName = this.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
        this.imports = `import { Injectable } from '@angular/core';\n`+
                       `import { HttpClient } from '@angular/common/http';\n` + 
                       `import { Observable } from 'rxjs';\n\n` +

                       `import { environment } from 'src/environments/environment';\n` +
                       `import { ${this.name} } from '../models/${fileModelName}'; \n\n`;
        

    }

    generateModelImports(): void{
        this.imports = '';
    }

    generateExternalModels(){
        const body = JSON.parse(this.entity.json);
        const properties = Object.keys(body);
        for(let property of properties){
            const isExternalModel = this.getType(property, body, false).includes('Model');
            const hasInEntities = this.entities.some(entity => entity.name && entity.name.toLowerCase() === property.toLowerCase());
            if(isExternalModel && !hasInEntities){
                let destObj = body[property];
                if(Array.isArray(destObj)){
                    destObj = body[property][0];
                }
                const destinationEntity: EntityConvert = {
                    basePackage: this.entity.basePackage,
                    json: JSON.stringify(destObj),
                    name: property,
                    relationships: []
                }
                this.jsonConverter.generateAngular(destinationEntity, [...this.entities, destinationEntity],this.zip);
            }
        }
    }

    generateModelBody(): string{
        const {indentation} = this;
        const body = JSON.parse(this.entity.json);
        const properties = Object.keys(body);
        let modelbody = '\n';
        modelbody += `export interface ${this.name}{\n`;
        for(let property of properties){
            console.log(property);
            modelbody += `${indentation}${property}: ${this.getType(property, body)};\n`
        }
        modelbody += '}\n'
        return modelbody;
    }

    generateServiceBody(): string{
        const {indentation} = this;
        let serviceBody = '\n';
        const className = this.name.replace('Model','Service');
        serviceBody += 
            `@Injectable({\n` +
                `${indentation}providedIn: 'root'\n`+
              `})\n`+    
            `export class ${className}{\n`;
        
        serviceBody += `\n${this.generateServiceConstructor()}\n${this.generateServiceMethods()}`;
    
        serviceBody += '}\n';
        return serviceBody;
    }

    generateServiceMethods(): string{
        const {indentation,name} = this;
        const endpointName = name.replace('Model','').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
        return `${indentation}\nfindAll(): Observable<${name}[]>{\n` +
               `${indentation}${indentation}return this.http.get<${name}[]>(\`\${environment.apiEndpoint}/${endpointName}\`);\n` +
               `${indentation}}\n` + 
               `${indentation}\nfindById(id: number): Observable<${name}>{\n` +
               `${indentation}${indentation}return this.http.get<${name}>(\`\${environment.apiEndpoint}/${endpointName}/\${id}\`);\n` +
               `${indentation}}\n` +
               `${indentation}\ninsert(model: ${name}): Observable<${name}>{\n` +
               `${indentation}${indentation}return this.http.post<${name}>(\`\${environment.apiEndpoint}/${endpointName}\`,model);\n` +
               `${indentation}}\n` +
               `${indentation}\ndelete(id: number): Observable<${name}>{\n` +
               `${indentation}${indentation}return this.http.delete<${name}>(\`\${environment.apiEndpoint}/${endpointName}/\${id}\`);\n` +
               `${indentation}}\n` +
               `${indentation}\nupdate(model: ${name}, id: number): Observable<${name}>{\n` +
               `${indentation}${indentation}return this.http.put<${name}>(\`\${environment.apiEndpoint}/${endpointName}/\${id}\`,model);\n` +
               `${indentation}}\n`;

    }

    generateServiceConstructor(): string{
        return `${this.indentation}constructor(private http: HttpClient) { }\n`;
    }

    getType(property: string, body: object, changeImports = true): string{
        console.log(property, body);
        let type: string = typeof body[property];
        if(type === 'object' && !Array.isArray(body[property])){
            type = `${property[0].toUpperCase() + property.slice(1)}Model`;
            const fileModelDestinationName = type.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
            if(changeImports)
                this.imports += `import { ${type} } from './${fileModelDestinationName}';\n`
        }else if(Array.isArray(body[property]) && !!body[property].length){
            if(typeof body[property][0] === 'object'){
                const propertyName = `${property[0].toUpperCase() + property.slice(1)}Model`;
                type = propertyName+'[]';
                const fileModelDestinationName = propertyName.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                if(changeImports)
                    this.imports += `import { ${propertyName} } from './${fileModelDestinationName}';\n`
                
            }else{
                type = `${typeof body[property][0]}[]`
            }
        }
        return type;
    }

    

}