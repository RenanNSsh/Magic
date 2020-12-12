import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonConverterService {

  constructor() { }

  private inernalJavaConverter(json, name): string{
    
    let indentation;
    let classesArray;
    let classObj = {};

    function json_to_java(input) {
        let textjson = input.toString();
        let convert = {};
        indentation = "  ";
        classesArray = [];
        classObj = {};
        try {
            convert = JSON.parse(textjson);
            let classes = createClasses(convert, `${name}Model`, indentation);
            return classes;
        } catch (e) {
            return "Error : \n" + e;
        }
    }


    function createClass(obj, label, indentation) {
        let classText = "public" + " " + "class " + label + " {\n";
        classText = classText + parser(obj, indentation) + "\n}";
        classesArray.push(classText);
    }

    function createClasses(obj, startingLabel, indentation) {
        createClass(obj, startingLabel, indentation);
        return classesArray.reverse().join("\n");
    }

    function parser(obj, indent) {
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
                        classObj[keyNames[i]] = keyNames[i] + "Object";
                        output += keyNames[i] + " " + classObj[keyNames[i]] + ";\n"; // Don't change the order. CreateClass should be called at last.
                        getterMethods.push(indent + "public " + keyNames[i] + " get" + keyNames[i] + "() {\n" + indent + indent +
                            "return " + classObj[keyNames[i]] + ";\n" + indent + "}");
                        setterMethods.push(indent + "public void set" + keyNames[i] + "( " + keyNames[i] + " " + keys[i] +
                            "Object ) {\n" + indent + indent + "this." + classObj[keyNames[i]] + " = " + keys[i] + "Object" + ";\n" +
                            indent + "}");
                        createClass(obj[keys[i]], keyNames[i], indent);
                    }
            }
        }
        output += "\n\n // Getter Methods \n\n" + getterMethods.join("\n\n") + "\n\n // Setter Methods \n\n" +
            setterMethods.join("\n\n");
        return output;
    }

    return json_to_java(json);
  }

  toJava(json: string, name: string){
    name = name[0].toUpperCase() + name.slice(1);
    const entityConverted = this.inernalJavaConverter(json, name);
    console.log(entityConverted);
    return entityConverted;
  }
}
