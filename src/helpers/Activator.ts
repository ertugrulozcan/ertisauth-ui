import { FieldInfo } from "../models/schema/FieldInfo"

export class Activator {
    newInstance<T>(type: (new () => T)): T {
        return new type();
    }

    static createFieldValue(fieldInfo: FieldInfo): any {
        const fieldType = fieldInfo.type
        switch (fieldType.toString()) {		
            case "object":
            case "json":
                return {}
            case "string":
            case "longtext":
            case "richtext":
            case "email":
            case "uri":
            case "hostname":
                return ""
            case "integer":
                return 0
            case "float":
                return 0.0
            case "boolean":
                return false
            case "array":
                return []
            case "date":
            case "datetime":
                return new Date()
            case "color":
                return null
            case "location":
                return { latitude: null, longitude: null }
            case "code":
                return { language: null, code: "" }
            // ???
            case "enum":
            case "const":
            default:
                return null
        }
    }
}