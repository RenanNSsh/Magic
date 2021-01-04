import * as JSZip from 'jszip';
import { EntityConvert } from '../models/entity-convert';
import { JsonConverterService } from './json-converter.service';


export class JsonConverterFlutter{

    private indentation = '  ';
    private entity: EntityConvert;
    private entities: EntityConvert[];
    private name: string;
    private zip: JSZip;
    private imports: string;
    private appName: string;
    
    constructor(private jsonConverter: JsonConverterService){

    }

    public generate(entity: EntityConvert, entities: EntityConvert[], zip: JSZip,appName: string){
        this.entity = entity;
        this.entities = entities;
        this.zip = zip;
        this.name = entity.name[0].toUpperCase() + entity.name.slice(1) + 'Model';
        this.appName = appName;
        this.generateModel();
        this.generateService();
    }

    
    private generateModel(){

        this.generateModelImports();
        const modelBody = this.generateModelBody();
        this.generateExternalModels();

        const folder = 'models';
        const modelsFolder = this.zip.folder(folder);
        const fileModelName = this.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
        modelsFolder.file(`${fileModelName}.dart`,this.imports+modelBody);
    }

    
    private generateService(){
        
        this.generateServiceImports();

        const serviceBody = this.generateServiceBody();

        const folder = 'services';
        const servicesFolder = this.zip.folder(folder);
        const fileName = this.name.replace('Model','Service')
                                       .replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();

        servicesFolder.file(`${fileName}.dart`,this.imports+serviceBody);
    }

    private generateServiceImports(){
        const fileModelName = this.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
        this.imports = `import 'dart:convert';\n` + 
                       `import 'package:http/http.dart' as http;\n\n` +

                       `import 'package:${this.appName}/config.dart';\n` +
                       `import 'package:${this.appName}/models/${fileModelName}.dart'; \n\n`;
        

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
                    appName: this.entity.appName,
                    relationships: []
                }
                this.jsonConverter.generateFlutter(destinationEntity, [...this.entities, destinationEntity],this.zip, this.appName);
            }
        }
    }

    generateModelBody(): string{
        const {indentation} = this;
        const body = JSON.parse(this.entity.json);
        const properties = Object.keys(body);
        let modelbody = '\n';
        modelbody += `class ${this.name}{\n`;
        for(let property of properties){
            modelbody += `${indentation}${this.getType(property, body)} ${property};\n`
        }
        modelbody += this.generateModelMethods(properties);
        modelbody += '}\n'
        return modelbody;
    }

    generateModelMethods(properties: string[]): string{
        
        return `${this.generateConstructors(properties)}\n` +
               `${this.jsonMethods(properties)}`;
    }

    generateConstructors(properties: string[]): string{
        const {indentation, name} = this;
        let constructors = `${indentation}${name}({\n`;
        properties.forEach((property, index) => {
            constructors += `${indentation}${indentation}this.${property}${index == properties.length -1 ? '' : ','}\n`;
        });
        constructors     += `${indentation}});\n\n`

        
        constructors += `${indentation}${name}.fromJson(Map<String, dynamic> json) {\n`;
        for(let property of properties){
            constructors += `${indentation}${indentation}${property} = json['${property}'];\n`;
        }
        constructors     += `${indentation}}\n`
        return constructors;
    }

    jsonMethods(properties: string[]): string{
        const {indentation, name} = this;
        let jsonMethods = `${indentation}Map<String, dynamic> toJson() {\n`;
        jsonMethods    += `${indentation}${indentation}final Map<String, dynamic> data = Map<String, dynamic>();\n`;
        for(let property of properties){
            jsonMethods+= `\n${indentation}${indentation}data['${property}'] = this.${property};`;
        }
        jsonMethods    += `\n${indentation}}\n`
        return jsonMethods;

    }

    generateServiceBody(): string{
        const {indentation} = this;
        let serviceBody = '\n';
        const className = this.name.replace('Model','Service');
        serviceBody += `class ${className}{\n`;
        
        serviceBody += `\n\n${this.generateServiceMethods()}`;
    
        serviceBody += '}\n';
        return serviceBody;
    }

    generateServiceMethods(): string{
        const {indentation,name} = this;
        const endpointName = name.replace('Model','').replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
        return `${indentation}Future<List<${name}>> findAll(){\n` +
               `${indentation}${indentation}return http.get('\$apiEndpoint/${endpointName}').then((response) {\n` +
               `${indentation}${indentation}${indentation}var modelsJSON = json.decode(Utf8Decoder().convert(response.bodyBytes)); \n` +
               `${indentation}${indentation}${indentation}List<${name}> models = modelsJSON.map<${name}>((modelJson) => ${name}.fromJson(modelJson)).toList(); \n` +
               `${indentation}${indentation}${indentation}return models; \n` +
               `${indentation}${indentation}});\n` +
               `${indentation}}\n` + 
               `${indentation}Future<${name}> findById(int id){\n` +
               `${indentation}${indentation}return http.get('\$apiEndpoint/${endpointName}/\$id').then((response) {\n` +
               `${indentation}${indentation}${indentation}var modelJSON = json.decode(Utf8Decoder().convert(response.bodyBytes)); \n` +
               `${indentation}${indentation}${indentation}${name} model = ${name}.fromJson(modelJSON); \n` +
               `${indentation}${indentation}${indentation}return model; \n` +
               `${indentation}${indentation}});\n` +
               `${indentation}}\n` +
               `${indentation}Future<${name}> insert(${name} model){\n` +
               `${indentation}${indentation}return http.post('\$apiEndpoint/${endpointName}',headers: {'Content-type': 'application/json'},body: json.encode(model)).then((response) {\n` +
               `${indentation}${indentation}${indentation}var modelJSON = json.decode(Utf8Decoder().convert(response.bodyBytes)); \n` +
               `${indentation}${indentation}${indentation}${name} model = ${name}.fromJson(modelJSON); \n` +
               `${indentation}${indentation}${indentation}return model; \n` +
               `${indentation}${indentation}});\n` +
               `${indentation}}\n` +
               `${indentation}Future<${name}> delete(int id){\n` +
               `${indentation}${indentation}return http.delete('\$apiEndpoint/${endpointName}/\$id').then((response) {\n` +
               `${indentation}${indentation}${indentation}var modelJSON = json.decode(Utf8Decoder().convert(response.bodyBytes)); \n` +
               `${indentation}${indentation}${indentation}${name} model = ${name}.fromJson(modelJSON); \n` +
               `${indentation}${indentation}${indentation}return model; \n` +     
               `${indentation}${indentation}});\n` +
               `${indentation}}\n` +
               `${indentation}Future<${name}> update(${name} model, int id){\n` +
               `${indentation}${indentation}return http.put('\$apiEndpoint/${endpointName}/\$id',headers: {'Content-type': 'application/json'},body: json.encode(model)).then((response) {\n` +
               `${indentation}${indentation}${indentation}var modelJSON = json.decode(Utf8Decoder().convert(response.bodyBytes)); \n` +
               `${indentation}${indentation}${indentation}${name} model = ${name}.fromJson(modelJSON); \n` +
               `${indentation}${indentation}${indentation}return model; \n` +     
               `${indentation}${indentation}});\n` +
               `${indentation}}\n`;

    }

    getType(property: string, body: object, changeImports = true): string{
        let type: string = typeof body[property];
        if(type === 'object' && !Array.isArray(body[property])){
            type = `${property[0].toUpperCase() + property.slice(1)}Model`;
            const fileModelDestinationName = type.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
            if(changeImports)
                this.imports += `import 'package:${this.appName}/models/${fileModelDestinationName}.dart';\n`
        }else if(Array.isArray(body[property]) && !!body[property].length){
            if(typeof body[property][0] === 'object'){
                const propertyName = `${property[0].toUpperCase() + property.slice(1)}Model`;
                type = propertyName+'[]';
                const fileModelDestinationName = propertyName.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
                if(changeImports)
                    this.imports += `import 'package:${this.appName}/models/${fileModelDestinationName}.dart';\n`
                
            }else{
                type = `${typeof body[property][0]}[]`
            }
        }else if( type === 'number'){
            
            if(body[property].toString().includes('.')){
                return 'double';
            }else{
                return 'int';
            }
        }else if(type === 'boolean'){
            return 'bool';
        }else if(type === 'string'){
            return 'String';
        }
        return type;
    }

    
}

