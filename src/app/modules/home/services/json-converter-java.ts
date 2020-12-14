import * as JSZip from 'jszip';

export class JsonConverterJava{

    private indentation = '  ';
    private classesArray = [];
    private classObj = {};

    private json_to_java(input: string, name): string{
        let textjson = input.toString();
        try {
            const convert = JSON.parse(textjson);
            let classes = this.createClasses(convert, `${name}Model`, this.indentation);
            return classes;
        } catch (e) {
            return 'Error : \n' + e;
        }
    }

    private createClasses(obj, startingLabel: string, indentation: string): string {
        this.createClass(obj, startingLabel, indentation);
        return this.classesArray.reverse().join('\n');
    }

    private createClass(obj, label, indentation) {
        let classText = "public" + " " + "class " + label + " {\n";
        classText = classText + this.parser(obj, indentation) + "\n}";
        this.classesArray.push(classText);
    }

    private parser(obj, indent) {
        let output = "";
        let keys = Object.keys(obj);
        let keyNames = [];
        let getterMethods = [];
        let setterMethods = [];
        for (let i in keys) {
            keyNames[i] = keys[i][0].toUpperCase() + keys[i].slice(1);
            output += indent;
            switch (typeof obj[keys[i]]) {
                case 'string':
                  const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
                  let type = 'String';
                  if(isoDateRegex.test(obj[keys[i]])){
                    type = 'Date'
                  }
                    output += `private ${type} ` + keys[i];
                    output += ";\n";
                    getterMethods.push(indent + `public ${type} get` + keyNames[i] + "() {\n" + indent + indent + "return " + keys[i] +
                        ";\n" + indent + "}");
                    setterMethods.push(indent + "public void set" + keyNames[i] + `( ${type} ` + keys[i] + " ) {\n" + indent + indent +
                        "this." + keys[i] + " = " + keys[i] + ";\n" + indent + "}");
                    break;
                case 'number':
                  let typeNumber = 'Integer';
                  if(obj[keys[i]].toString().includes('.')){
                    typeNumber = 'Double';
                  }
                    output += `private ${typeNumber} ` + keys[i];
                    output += ";\n";
                    getterMethods.push(indent + `public ${typeNumber} get` + keyNames[i] + "() {\n" + indent + indent + "return " + keys[i] +
                        ";\n" + indent + "}");
                    setterMethods.push(indent + "public void set" + keyNames[i] + `( ${typeNumber} ` + keys[i] + " ) {\n" + indent + indent +
                        "this." + keys[i] + " = " + keys[i] + ";\n" + indent + "}");
                    break;
                case 'boolean':
                    output += 'private Boolean ' + keys[i];
                    output += ";\n";
                    getterMethods.push(indent + "public Boolean get" + keyNames[i] + "() {\n" + indent + indent + "return " + keys[i] +
                        ";\n" + indent + "}");
                    setterMethods.push(indent + "public void set" + keyNames[i] + "( Boolean " + keys[i] + " ) {\n" + indent +
                        indent + "this." + keys[i] + " = " + keys[i] + ";\n" + indent + "}");
                    break;
                default:
                    if (obj[keys[i]] instanceof Array) {
                        output += 'ArrayList<Object> ' + keys[i] + " = new ArrayList<Object>()" + ";\n";
                    } else if (obj[keys[i]] == null || obj[keys[i]] == undefined) {
                        output += 'private String ' + keys[i] + " = null";
                        output += ";\n";
                        getterMethods.push(indent + "public String get" + keyNames[i] + "() {\n" + indent + indent + "return " + keys[i] +
                            ";\n" + indent + "}");
                        setterMethods.push(indent + "public void set" + keyNames[i] + "( String " + keys[i] + " ) {\n" + indent +
                            indent + "this." + keys[i] + " = " + keys[i] + ";\n" + indent + "}");
                    } else {
                        this.classObj[keyNames[i]] = keyNames[i] + "Object";
                        output += keyNames[i] + " " + this.classObj[keyNames[i]] + ";\n"; // Don't change the order. CreateClass should be called at last.
                        getterMethods.push(indent + "public " + keyNames[i] + " get" + keyNames[i] + "() {\n" + indent + indent +
                            "return " + this.classObj[keyNames[i]] + ";\n" + indent + "}");
                        setterMethods.push(indent + "public void set" + keyNames[i] + "( " + keyNames[i] + " " + keys[i] +
                            "Object ) {\n" + indent + indent + "this." + this.classObj[keyNames[i]] + " = " + keys[i] + "Object" + ";\n" +
                            indent + "}");
                        this.createClass(obj[keys[i]], keyNames[i], indent);
                    }
            }
        }
        output += "\n\n // Getter Methods \n\n" + getterMethods.join("\n\n") + "\n\n // Setter Methods \n\n" +
            setterMethods.join("\n\n");
        return output;
    }
    

    private inernalJavaConverter(json, name): string{
        return this.json_to_java(json, name);
      }

    private generateModel(json: string, name: string, folders: string, zip: JSZip){
      
        name = name[0].toUpperCase() + name.slice(1) + 'Model';
        const packageFolder = zip.folder(`${folders}/model`);
        const entityConverted = this.inernalJavaConverter(json, name);
        packageFolder.file(`${name}.java`,entityConverted);
      }
    
      private generateController(json: string, name: string, folders: string, zip: JSZip){
             
        name = name[0].toUpperCase() + name.slice(1) + 'Controller';
        const packageFolder = zip.folder(`${folders}/controller`);
        const entityConverted = this.inernalJavaConverter(json, name);
        packageFolder.file(`${name}.java`,entityConverted);
      }
    
      private generateService(json: string, name: string, folders: string, zip: JSZip){
        name = name[0].toUpperCase() + name.slice(1) + 'Service';
        const packageFolder = zip.folder(`${folders}/service`);
        const entityConverted = this.inernalJavaConverter(json, name);
        packageFolder.file(`${name}.java`,entityConverted);
      }
    
      
      private generateRepository(json: string, name: string, folders: string, zip: JSZip){
        name = name[0].toUpperCase() + name.slice(1) + 'Repository';
        const packageFolder = zip.folder(`${folders}/repository`);
        const entityConverted = this.inernalJavaConverter(json, name);
        packageFolder.file(`${name}.java`,entityConverted);
      }
    


    generate(json: string, name: string, basePackage: string,zip: JSZip){
        const folders = basePackage.replace(/\./g, '/');
        this.generateModel(json, name, folders, zip);
        this.generateService(json, name, folders, zip);
        this.generateController(json, name, folders, zip);
        this.generateRepository(json, name, folders, zip);
    }
}