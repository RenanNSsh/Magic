import * as JSZip from 'jszip';
import { EntityConvert } from '../models/entity-convert';
import { RelationshipField, RelationshipJSON } from '../models/relationship';
import { JavaConverterClassType } from './java-converter-class-type.enum';
import { JsonConverterService } from './json-converter.service';

export class JsonConverterJava{

    private indentation = '  ';
    private packages = '';
    private classesArray = [];
    private classObj = {};
    private entities: EntityConvert[] = [];
    private currentRelationship: RelationshipJSON;

    public constructor(private jsonConverter: JsonConverterService){

    }

    private json_to_java(input: string, name, type: JavaConverterClassType, basePackage: string, zip: JSZip, relationships: RelationshipField[] = null): string{
        let textjson = input.toString();
        try {
            const convert = JSON.parse(textjson);
            let classes = this.createClasses(convert, `${name}`, this.indentation, type, basePackage,zip,relationships);
            return classes;
        } catch (e) {
            return 'Error : \n' + e;
        }
    }

    private createClasses(obj, startingLabel: string, indentation: string, type: JavaConverterClassType, basePackage: string, zip: JSZip, relationships:RelationshipField[] = null): string {
        this.classesArray = [];
        this.createClass(obj, startingLabel, indentation,type, basePackage, zip,relationships);
        return this.classesArray.reverse().join('\n');
    }

    private generateDecorators( type: JavaConverterClassType,label: string): string{
        switch(type){
            case JavaConverterClassType.Model:
                return '@Entity\n';

            case JavaConverterClassType.Service:
                return '@Service\n';
                
            case JavaConverterClassType.Repository:
                return '@Repository\n';
                
            case JavaConverterClassType.Controller:
                let route = label.replace('Controller', '');
                route = route.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                return '@RestController\n' +
                       '@CrossOrigin()\n' +
                       `@RequestMapping(value="/${route}")\n`;
        }
    }

    private getInterfaceInheritance(type: JavaConverterClassType, label: string, basePackage:string): string{
        switch(type){
            case JavaConverterClassType.Model:
                return ' implements Serializable';
            case JavaConverterClassType.Repository:
                
                const className = label.replace('Repository', '') + 'Model';
                this.packages += `import ${basePackage}.model.${className}; \n\n`;
                return ` extends JpaRepository<${className},Integer>`;
            default: 
                return '';
        }
    }

    private getFileType(type: JavaConverterClassType): string{
        if(type === JavaConverterClassType.Repository){
            return 'interface ';
        }
        return 'class '
    }

    private generateServiceProperties(indentation: string, label: string, basepackage: string): string{
        
        const className = label.replace(new RegExp('Service$'), 'Repository');
        this.packages += `import ${basepackage}.repository.${className};\n\n`;

        return `${indentation}@Autowired\n`+
               `${indentation}private ${className} repository;`
    }

    private generateControllerProperties(indentation: string, label: string, basepackage: string): string{
        
        const className = label.replace(new RegExp('Controller$'), 'Service');
        this.packages += `import ${basepackage}.service.${className};\n\n`;

        return `${indentation}@Autowired\n`+
               `${indentation}private ${className} service;`
    }

    

    private generateControllerMethods(indentation: string, label: string, basepackage: string): string{
        const className = label.replace(new RegExp('Controller$'), 'Model');
        this.packages += `import ${basepackage}.model.${className};\n\n`;

        return `\n${indentation}@PostMapping\n`+ // insert
               `${indentation}public ResponseEntity<${className}> insert(@Valid @RequestBody ${className} model){\n` +
               `${indentation}${indentation}${className} modelCreated = service.insert(model);\n` +
               `${indentation}${indentation} URI location = ServletUriComponentsBuilder\n`+
               `${indentation}${indentation}                     .fromCurrentRequest()\n`+
               `${indentation}${indentation}                     .path("{/id}")` +
               `${indentation}${indentation}                     .buildAndExpand(modelCreated.getId()).toUri();\n` +
               `${indentation}${indentation}return ResponseEntity.created(location).body(modelCreated);\n` +
               `${indentation}};\n\n` +
               `${indentation}@DeleteMapping("/{id}")\n`+
               `${indentation}public ResponseEntity<${className}> delete(@PathVariable Integer id){\n` + // delete
               `${indentation}${indentation}${className} model = service.delete(id);\n` +
               `${indentation}${indentation}return ResponseEntity.ok().body(model);\n` +
               `${indentation}};\n\n` + 
               `${indentation}@GetMapping("/{id}")\n`+
               `${indentation}public ResponseEntity<${className}> findById(@PathVariable Integer id){\n` + // findById
               `${indentation}${indentation}${className} model = service.findById(id);\n` +
               `${indentation}${indentation}return ResponseEntity.ok().body(model);\n` +
               `${indentation}};\n\n` +
               `${indentation}@GetMapping\n`+
               `${indentation}public ResponseEntity<List<${className}>> findAll(){\n` + 
               `${indentation}${indentation}return ResponseEntity.ok().body(service.findAll());\n` +
               `${indentation}};\n\n` +
               `${indentation}@PutMapping("/{id}")\n`+
               `${indentation}public ResponseEntity<${className}> update(@PathVariable Integer id, @RequestBody ${className} model){\n` + // findById
               `${indentation}${indentation}${className} modelUpdated = service.update(model, id);\n` +
               `${indentation}${indentation}return ResponseEntity.ok().body(modelUpdated);\n` +
               `${indentation}};\n\n`
    }


    private generateServiceMethods(indentation: string, label: string, basepackage: string): string{
        const className = label.replace(new RegExp('Service$'), 'Model');
        this.packages += `import ${basepackage}.model.${className};\n\n`;

        return `\n${indentation}@Transactional\n`+ // insert
               `${indentation}public ${className} insert(${className} model){\n` +
               `${indentation}${indentation}model.setId(null);\n` +
               `${indentation}${indentation}return repository.save(model);\n` +
               `${indentation}};\n\n` +
               `${indentation}public ${className} delete(Integer id){\n` + // delete
               `${indentation}${indentation}${className} model = findById(id);\n` +
               `${indentation}${indentation}repository.deleteById(id);\n` +
               `${indentation}${indentation}return model;\n` +
               `${indentation}};\n\n` + 
               `${indentation}public ${className} findById(Integer id){\n` + // findById
               `${indentation}${indentation}Optional<${className}> model = repository.findById(id);\n` +
               `${indentation}${indentation}return model.orElseThrow(()-> new ObjectNotFoundException(\n` +
			   `${indentation}${indentation}${indentation}${indentation}"Objeto não encontrado! Id: " + id + ", Tipo: " + ${className}.class.getName()));\n` +
               `${indentation}};\n\n` +
               `${indentation}public List<${className}> findAll(){\n` + // findById
               `${indentation}${indentation}return repository.findAll();\n` +
               `${indentation}};\n\n` +
               `${indentation}public ${className} update(${className} model, Integer id){\n` + // findById
               `${indentation}${indentation}model.setId(id);\n` +
               `${indentation}${indentation}${className} modelUpdated = repository.save(model);\n` +
               `${indentation}${indentation}return modelUpdated;\n` +
               `${indentation}};\n\n`
    }

    private serviceClassBody(indentation, label: string, basepackage: string): string{
        return `\n${this.generateServiceProperties(indentation,label, basepackage)}\n${this.generateServiceMethods(indentation,label,basepackage)}`;
    }
    private controllerClassBody(indentation, label: string, basepackage: string): string{
        return `\n${this.generateControllerProperties(indentation,label, basepackage)}\n${this.generateControllerMethods(indentation,label,basepackage)}`;
    }

    private createClass(obj, label, indentation, type: JavaConverterClassType, basePackage: string, zip: JSZip, relationships:RelationshipField[] = null) {
        
        const decorators = this.generateDecorators(type, label);
        let classText =  decorators + 'public' + ' ' + this.getFileType(type) + label + this.getInterfaceInheritance(type, label, basePackage) +' {\n';
        switch(type){
            case JavaConverterClassType.Model:
                classText = classText + this.parser(obj, indentation,type, label,basePackage,zip,relationships) + '\n}';
                break;
            case JavaConverterClassType.Service:
                classText += this.serviceClassBody(indentation, label, basePackage) + '\n}';
                break;
            case JavaConverterClassType.Controller:
                classText += this.controllerClassBody(indentation, label, basePackage) + '\n';
            default:
                classText += '}';
                break;
        }
        this.classesArray.push(classText);
    }

    private parser(obj, indent, classType: JavaConverterClassType, label: string, basePackage: string, zip: JSZip, relationships:RelationshipField[] = null) {
        let output = '';
        let className = '';
        if(classType == JavaConverterClassType.Model){
            output = `${indent}private static final long serialVersionUID = 1L;\n\n`;
            className = label.replace('Model', '').replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toUpperCase();
        }
        let keys = Object.keys(obj);
        let keyNames = [];
        let getterMethods = [];
        let setterMethods = [];
        for (let i in keys) {
            keyNames[i] = keys[i][0].toUpperCase() + keys[i].slice(1);
            output += indent;
            if(keys[i] === 'id'){
                
                output+= '@Id\n' +
                         `${indent}@Column(name = "ID_${className}")\n` +
                         `${indent}@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "${className}_SEQ")\n` +
                         `${indent}@SequenceGenerator(name = "${className}_SEQ", sequenceName = "${className}_SEQ", allocationSize = 1)\n`;
                         output += indent;
            }
            switch (typeof obj[keys[i]]) {
                case 'string':
                  const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
                  let type = 'String';
                  if(isoDateRegex.test(obj[keys[i]])){
                    type = 'Date';
                    output += `@Temporal(TemporalType.TIMESTAMP)\n${indent}`;
                    if(!this.packages.includes('java.util.Date')){
                        this.packages += 'import java.util.Date;\n' +
                                         'import javax.persistence.Temporal;\n' +
                                         'import javax.persistence.TemporalType;\n\n';
                    }
                  }
                    output += `private ${type} ` + keys[i];
                    output += ';\n';
                    getterMethods.push(indent + `public ${type} get` + keyNames[i] + '() {\n' + indent + indent + 'return ' + keys[i] +
                        ';\n' + indent + '}');
                    setterMethods.push(indent + 'public void set' + keyNames[i] + `( ${type} ` + keys[i] + ' ) {\n' + indent + indent +
                        'this.' + keys[i] + ' = ' + keys[i] + ';\n' + indent + '}');
                    break;
                case 'number':
                  let typeNumber = 'Integer';
                  if(obj[keys[i]].toString().includes('.')){
                    typeNumber = 'Double';
                  }
                    output += `private ${typeNumber} ` + keys[i];
                    output += ';\n';
                    getterMethods.push(indent + `public ${typeNumber} get` + keyNames[i] + '() {\n' + indent + indent + 'return ' + keys[i] +
                        ';\n' + indent + '}');
                    setterMethods.push(indent + 'public void set' + keyNames[i] + `( ${typeNumber} ` + keys[i] + ' ) {\n' + indent + indent +
                        'this.' + keys[i] + ' = ' + keys[i] + ';\n' + indent + '}');
                    break;
                case 'boolean':
                    output += 'private Boolean ' + keys[i];
                    output += ';\n';
                    getterMethods.push(indent + 'public Boolean get' + keyNames[i] + '() {\n' + indent + indent + 'return ' + keys[i] +
                        ';\n' + indent + '}');
                    setterMethods.push(indent + 'public void set' + keyNames[i] + '( Boolean ' + keys[i] + ' ) {\n' + indent +
                        indent + 'this.' + keys[i] + ' = ' + keys[i] + ';\n' + indent + '}');
                    break;
                default:
                    if (obj[keys[i]] instanceof Array) { //TODO: Corrigir Array aqui
                        const arr =obj[keys[i]];
                        const entityAlreadyCreated = this.entities.find(x => x.name && x.name.toLowerCase() == keys[i].toLowerCase());
                        if(!!arr.length){
                          
                            const typeArr = this.getType(arr, keys[i]);
                            output += this.getRelationshipAnnotation( keys[i],relationships,label);
                            output += `private List<${typeArr}> ` + keys[i] + ';\n';
                            getterMethods.push(indent + `public List<${typeArr}> get` + keyNames[i] + '() {\n' + indent + indent + 'return ' + keys[i] +
                            ';\n' + indent + '}');
                        setterMethods.push(indent + 'public void set' + keyNames[i] + `( List<${typeArr}> ` + keys[i] + ' ) {\n' + indent +
                            indent + 'this.' + keys[i] + ' = ' + keys[i] + ';\n' + indent + '}');
                            if(typeArr.includes('Model')){
                                let labelField = label.replace('Model', '');
                                console.log(this.getRelationshipAnnotation( keys[i],relationships,label));
                                labelField = labelField[0].toLowerCase() + labelField.slice(1);
                                const relationshipDestination = this.getDestinationRelationship();
                                if(!entityAlreadyCreated){
                                    const destinationObj = obj[keys[i]][0];
                                    destinationObj[labelField] = {
                                        id: 1
                                    };
                                    console.log(relationshipDestination)
                                    this.jsonConverter.generateJava(JSON.stringify(destinationObj), keyNames[i], basePackage,[{label: labelField, relationship:relationshipDestination, isWeak: true }], zip,this.entities);
                                }else{    
                                    const objCreated = JSON.parse(entityAlreadyCreated.json);
                                    if(relationshipDestination === RelationshipJSON.OneToMany || relationshipDestination === RelationshipJSON.OneToOne){
                                        objCreated[labelField] = {
                                            id: 1
                                        }
                                    }else{
                                        objCreated[labelField] = [
                                            {
                                                id: 1
                                            }
                                        ]
                                    }
                                    entityAlreadyCreated.json = JSON.stringify(objCreated);
                                    entityAlreadyCreated.relationships.push({label: labelField,relationship: relationshipDestination,isWeak: true});
                                    this.jsonConverter.generateJava(entityAlreadyCreated.json, entityAlreadyCreated.name, entityAlreadyCreated.basePackage,entityAlreadyCreated.relationships, zip,this.entities);
                                }
                            }
                        }
                    } else if (obj[keys[i]] == null || obj[keys[i]] == undefined) { //TODO: Corrigir null / undefined
                        output += 'private String ' + keys[i] + ' = null';
                        output += ';\n';
                        getterMethods.push(indent + 'public String get' + keyNames[i] + '() {\n' + indent + indent + 'return ' + keys[i] +
                            ';\n' + indent + '}');
                        setterMethods.push(indent + 'public void set' + keyNames[i] + '( String ' + keys[i] + ' ) {\n' + indent +
                            indent + 'this.' + keys[i] + ' = ' + keys[i] + ';\n' + indent + '}');
                    } else {
                        this.classObj[keyNames[i]] = keyNames[i][0].toLowerCase() + keyNames[i].slice(1);
                        this.packages += `import ${basePackage}.model.${keyNames[i]}Model;\n`;
                        output += this.getRelationshipAnnotation(this.classObj[keyNames[i]],relationships,label);
                        console.log(this.getRelationshipAnnotation(this.classObj[keyNames[i]],relationships,label));
                        output += keyNames[i] + 'Model ' + this.classObj[keyNames[i]] + ';\n'; // Don't change the order. CreateClass should be called at last.
                        getterMethods.push(indent + 'public ' + keyNames[i] + 'Model get' + keyNames[i] + '() {\n' + indent + indent +
                            'return ' + this.classObj[keyNames[i]] + ';\n' + indent + '}');
                        setterMethods.push(indent + 'public void set' + keyNames[i] + '( ' + keyNames[i] + 'Model ' + keys[i] +
                            ' ) {\n' + indent + indent + 'this.' + this.classObj[keyNames[i]] + ' = ' + keys[i]  + ';\n' +
                            indent + '}');
                        
                        let labelField = label.replace('Model', '');
                        labelField = labelField[0].toLowerCase() + labelField.slice(1);
                        const indexEntityAlreadyCreated = this.entities.findIndex(entity => relationships.some(relationship =>entity && relationship.label.toLowerCase() == entity.name.toLowerCase()));
                        const entityAlreadyCreated = this.entities[indexEntityAlreadyCreated];
                        const relationshipDestination = this.getDestinationRelationship();
                        if(!entityAlreadyCreated){
                            const destinationObj = obj[keys[i]];
                            destinationObj[labelField] = {
                                id: 1
                            };
                            this.jsonConverter.generateJava(JSON.stringify(destinationObj), keyNames[i], basePackage,[{label: labelField, relationship:relationshipDestination, isWeak: true }], zip,this.entities);
                        }else{
                            const objCreated = JSON.parse(entityAlreadyCreated.json);
                            console.log(objCreated);
                            if(!objCreated[labelField]){
                                if(relationshipDestination === RelationshipJSON.OneToMany || relationshipDestination === RelationshipJSON.OneToOne){
                                    objCreated[labelField] = {
                                        id: 1
                                    }
                                }else{
                                    objCreated[labelField] = [
                                        {
                                            id: 1
                                        }
                                    ]
                                }
                                entityAlreadyCreated.json = JSON.stringify(objCreated);
                                entityAlreadyCreated.relationships.push({label: labelField,relationship: relationshipDestination,isWeak: true});
                                this.jsonConverter.generateJava(entityAlreadyCreated.json, entityAlreadyCreated.name, entityAlreadyCreated.basePackage,entityAlreadyCreated.relationships, zip,this.entities);
                       
                            }
                            
                        }
                        // this.createClass(obj[keys[i]], keyNames[i], indent, classType,basePackage);
                    }

            }
        }
        output += `\n${indent}public ${label}() {\n\n${indent}}`
        output += '\n\n // Getter Methods \n\n' + getterMethods.join('\n\n') + '\n\n // Setter Methods \n\n' +
            setterMethods.join('\n\n');
        return output;
    }

    getType(array: any[],entityName: string): string{
        switch(typeof array[0]){
            case 'string':
                return 'String';
            case 'boolean':
                return 'Boolean';
            case 'number':
                if(array[0].toString().includes('.')){
                    return 'Double';
                }
                return 'Integer';
            case 'object':
                return `${entityName[0].toUpperCase() + entityName.slice(1) + 'Model'}`;
                
        }
    }

    getDestinationRelationship(){
        if(this.currentRelationship === RelationshipJSON.OneToMany){
            return RelationshipJSON.ManyToOne;
        }
        if(this.currentRelationship === RelationshipJSON.ManyToOne){
            return RelationshipJSON.OneToMany;
        }
        console.log(this.currentRelationship);
        return this.currentRelationship;
    }

    getRelationshipAnnotation(fieldName: string, relationships: RelationshipField[],className: string ): string{
        console.log(relationships);
        for(let relationship of relationships){
            if(!!relationship.label && !!fieldName && fieldName.toLowerCase() === relationship.label.toLowerCase()){
                this.currentRelationship = relationship.relationship;
                return this.getRelationshipString(relationship,className);
            }
        }
        return '';
    }

    getRelationshipString(relationshipField: RelationshipField,className: string): string{
        className = className.replace('Model', '');
        const classField = className[0].toLowerCase() + className.slice(1);
        const classIdColumn = 'id_'+relationshipField.label.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_');
        const relationship = relationshipField.relationship;
        console.log(relationshipField);
        switch(relationship){
            case RelationshipJSON.OneToOne:
                return `@OneToOne${relationshipField.isWeak ? '' : `(mappedBy = "${classField}",cascade=CascadeType.ALL)`}\n${this.indentation}` + 
                        `${relationshipField.isWeak ? `@MapsId\n${this.indentation}` :''}`;
            case RelationshipJSON.ManyToMany:
                return `@ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)\n${this.indentation}`;
            case RelationshipJSON.ManyToOne:
                return '@ManyToOne\n' +
                       `${this.indentation}@JoinColumn(name="${classIdColumn}")\n${this.indentation}`;
            case RelationshipJSON.OneToMany:
                return `@OneToMany(mappedBy="${className.toLowerCase()}")\n${this.indentation}`
                       
        }
    }

    private inernalJavaConverter(json, name, type: JavaConverterClassType, basePackage: string, zip: JSZip, relationships: RelationshipField[] = null): string{
        return this.json_to_java(json, name, type, basePackage,zip,relationships);
      }

    private generateModelPackages(basePackage: string){
        this.packages = `package ${basePackage}.model;\n\n` +
                'import javax.persistence.Entity;\n' +
                'import javax.persistence.Column;\n' +
                'import javax.persistence.GeneratedValue;\n' +
                'import javax.persistence.GenerationType;\n' + 
                'import javax.persistence.SequenceGenerator;\n' +
                'import javax.persistence.Id;\n' + 
                'import java.io.Serializable;\n\n';
    }

    private generateControllerPackages(basePackage: string){
        this.packages = `package ${basePackage}.controller;\n\n` +
                'import org.springframework.http.ResponseEntity;\n' +
                'import java.net.URI;\n' +
                'import javax.validation.Valid;\n' +
                'import org.springframework.web.bind.annotation.CrossOrigin;\n' +
                'import org.springframework.beans.factory.annotation.Autowired;\n' + 
                'import org.springframework.web.bind.annotation.DeleteMapping;\n' +
                'import org.springframework.web.bind.annotation.GetMapping;\n' + 
                'import org.springframework.web.bind.annotation.PathVariable;\n' +
                'import org.springframework.web.bind.annotation.PostMapping;\n' +
                'import org.springframework.web.bind.annotation.PutMapping;\n' +
                'import org.springframework.web.bind.annotation.RequestBody;\n' +
                'import org.springframework.web.bind.annotation.RequestMapping;\n' +
                'import org.springframework.web.bind.annotation.RequestMethod;\n' +
                'import org.springframework.web.bind.annotation.RestController;\n' +
                'import java.util.List;\n' +
                'import org.springframework.web.servlet.support.ServletUriComponentsBuilder;\n\n'
    }

    private generateServicePackages(basePackage: string){
        this.packages = `package ${basePackage}.service;\n\n` +
                `import ${basePackage}.service.exceptions.ObjectNotFoundException;\n` +
                'import org.springframework.transaction.annotation.Transactional;\n' +
                'import org.springframework.beans.factory.annotation.Autowired;\n' + 
                'import org.springframework.stereotype.Service;\n' + 
                'import java.util.Optional;\n' +
                'import java.util.List;\n\n';
    }

    private generateRepositoryPackages(basePackage: string){
        this.packages = `package ${basePackage}.repository;\n\n` +
                'import org.springframework.stereotype.Repository;\n' +
                'import org.springframework.data.jpa.repository.JpaRepository;\n' +
                'import org.springframework.data.jpa.repository.Query;\n' + 
                'import org.springframework.data.repository.query.Param;\n\n';
    }

    private generateModel(json: string, name: string, basePackage: string,relationships: RelationshipField[], zip: JSZip){
        const folders = basePackage.replace(/\./g, '/');
        name = name[0].toUpperCase() + name.slice(1) + 'Model';
        const packageFolder = zip.folder(`${folders}/model`);

        this.generateModelPackages(basePackage);
        const entityConverted = this.inernalJavaConverter(json, name,JavaConverterClassType.Model,basePackage,zip,relationships);

        packageFolder.file(`${name}.java`,`${this.packages}${entityConverted}`);
      }
    
      private generateController(json: string, name: string, basePackage: string, zip: JSZip){
        const folders = basePackage.replace(/\./g, '/');             
        name = name[0].toUpperCase() + name.slice(1) + 'Controller';

        const packageFolder = zip.folder(`${folders}/controller`);

        this.generateControllerPackages(basePackage);
        const entityConverted = this.inernalJavaConverter(json, name,JavaConverterClassType.Controller,basePackage,zip);

        packageFolder.file(`${name}.java`,`${this.packages}${entityConverted}`);
      }
    
      private generateService(json: string, name: string, basePackage: string, zip: JSZip){
        const folders = basePackage.replace(/\./g, '/');
        name = name[0].toUpperCase() + name.slice(1) + 'Service';
        const packageFolder = zip.folder(`${folders}/service`);

        this.generateServicePackages(basePackage);
        const entityConverted = this.inernalJavaConverter(json, name,JavaConverterClassType.Service,basePackage,zip);

        packageFolder.file(`${name}.java`,`${this.packages}${entityConverted}`);
      }
    
      
      private generateRepository(json: string, name: string, basePackage: string, zip: JSZip){
        const folders = basePackage.replace(/\./g, '/');
        name = name[0].toUpperCase() + name.slice(1) + 'Repository';
        const packageFolder = zip.folder(`${folders}/repository`);

        this.generateRepositoryPackages(basePackage);
        const entityConverted = this.inernalJavaConverter(json, name,JavaConverterClassType.Repository,basePackage,zip);

        packageFolder.file(`${name}.java`,`${this.packages}${entityConverted}`);
      }
    


    generate(json: string, name: string, basePackage: string,relationships: RelationshipField[], zip: JSZip,entities: EntityConvert[]){
        this.entities = entities;
        this.currentRelationship = null;
        this.generateModel(json, name, basePackage,relationships, zip);
        this.generateService(json, name, basePackage, zip);
        this.generateController(json, name, basePackage, zip);
        this.generateRepository(json, name, basePackage, zip);
    }
}