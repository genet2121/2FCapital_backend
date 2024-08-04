const fieldRules = require('../../../configuration/fieldRules.json');


module.exports = class Validator {

    dependencies;
    constructor(dbs){
        this.dependencies = dbs;
    }

    async validateRecord(tableName, request) {

        try{
            const tableRules = fieldRules[tableName];
            const requiredFields = Object.keys(tableRules.fields).filter(field => tableRules.fields[field].required);
        
            const missingFields = [];
        
            requiredFields.forEach(field => {
                if (!(field in request)) {
                    missingFields.push(field);
                }
            });
                
            if(missingFields.length > 0){
                throw this.dependencies.exceptionHandling.throwError('Validation error: required fields are missing: '+ missingFields.join(","), 422);
            }
            
            for (const field in tableRules.fields) {
                if (field in request) {
                    const rule = tableRules.fields[field];

                    // Regular expression to avoid potentially harmful content
                    const harmfulContentRegex = /<script[\s\S]*?>[\s\S]*?<\/script>|<.*?>|;/;

                    if (harmfulContentRegex.test(request[field])) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} contains invalid characters`, 422);
                    }


                    if (rule.type === 'string' && typeof request[field] !== 'string') {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a string`, 422);
                    }
                    if (rule.type === 'number' && typeof request[field] !== 'number') {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a number`, 422);
                    }
                    if (rule.type === 'boolean' && typeof request[field] !== 'boolean') {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a boolean`, 422);
                    }
                    if (rule.type === 'date' && !this.isValidDateFormat(request[field])) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"`, 422);
                    }
                    if (rule.minLength && request[field].length < rule.minLength) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at least ${rule.minLength} characters long`, 422);
                    }
                    if (rule.maxLength && request[field].length > rule.maxLength) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at most ${rule.maxLength} characters long`, 422);
                    }
                    if (rule.type === 'choice' && !rule.allowedValues.includes(request[field])) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be one of ${JSON.stringify(rule.allowedValues)}`, 422);
                    }


                    if (rule.type === 'number') {
                        if (rule.minValue !== undefined && request[field] < rule.minValue) {
                            throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at least ${rule.minValue}`, 422);
                        }
                        if (rule.maxValue !== undefined && request[field] > rule.maxValue) {
                            throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at most ${rule.maxValue}`, 422);
                        }
                    }

                    if (rule.unique) {
                        let recordFoundOnUniqueRecord =  await this.checkRecordOnUniqueFieldOnUpdate(request, tableName, field, request[field])
                        if(recordFoundOnUniqueRecord){
                            throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} is already in use. Please enter a different value`, 409);
                        }
                    }
                }
            }

            if(fieldRules[tableName].keys){
                let foreignColumns = fieldRules[tableName].keys;         
                for(let i = 0; i < foreignColumns.length; i++){
                    let columnValue = request[foreignColumns[i].column];
                    let whereQuery = {};
                    // whereQuery[fieldRules[tableName].keys[i]] = columnValue;
                    whereQuery.id = columnValue; 
                    let forKeyCheck = await this.foreignKeyMissing(foreignColumns[i].table, whereQuery, columnValue);
                }
            }

            return true;
        } catch(error) {
            console.log(error);
            if(error.statusCode) {
                throw this.dependencies.exceptionHandling.throwError(error.message, error.statusCode);
            } else {
                throw this.dependencies.exceptionHandling.throwError(error.message, 500);
            }
        }
        
        
    }

    async validatOnUpdateRecord(tableName, request) {
        
        const tableRules = fieldRules[tableName];
        const requiredFields = Object.keys(tableRules.fields).filter(field => tableRules.fields[field].required);
       
        const missingFields = [];
       
        for (const field in tableRules.fields) {
            if (field in request) {
                const rule = tableRules.fields[field];

                  // Regular expression to avoid potentially harmful content
                  const harmfulContentRegex = /<script[\s\S]*?>[\s\S]*?<\/script>|<.*?>|;/;

                  if (harmfulContentRegex.test(request[field])) {
                      throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} contains invalid characters`, 422);
                  }


                if (rule.type === 'string' && typeof request[field] !== 'string') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a string`, 422);
                }
                if (rule.type === 'number' && typeof request[field] !== 'number') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a number`, 422);
                }
                if (rule.type === 'boolean' && typeof request[field] !== 'boolean') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be a boolean`, 422);
                }
                if (rule.type === 'date' && !this.isValidDateFormat(request[field])) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"`, 422);
                }
                if (rule.minLength && request[field].length < rule.minLength) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at least ${rule.minLength} characters long`, 422);
                }
                if (rule.maxLength && request[field].length > rule.maxLength) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at most ${rule.maxLength} characters long`, 422);
                }
                if (rule.type === 'choice' && !rule.allowedValues.includes(request[field])) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be one of ${JSON.stringify(rule.allowedValues)}`, 422);
                }
                if (rule.type === 'date' && !this.isValidDateFormat(request[field])) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"`, 422);
                }

                if (rule.type === 'number') {
                    if (rule.minValue !== undefined && request[field] < rule.minValue) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at least ${rule.minValue}`, 422);
                    }
                    if (rule.maxValue !== undefined && request[field] > rule.maxValue) {
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} must be at most ${rule.maxValue}`, 422);
                    }
                }

                if (rule.unique) {
                  
                    let recordFoundOnUniqueRecord =  await this.checkRecordOnUniqueFieldOnUpdate(request,tableName, field, request[field])
                    
                    if(recordFoundOnUniqueRecord){
                        throw this.dependencies.exceptionHandling.throwError(`Validation error: ${field} is already in use. Please enter a different value`, 422);
                    }
                }
            }
        }

        
        if(fieldRules[tableName].keys){
            let foreignColumns = fieldRules[tableName].keys;         
            for(let i = 0; i < foreignColumns.length; i++){
                let columnValue = request[foreignColumns[i].column];
                let whereQuery = {};
                whereQuery.id = columnValue; 
                let forKeyCheck = await this.foreignKeyMissing(foreignColumns[i].table, whereQuery, columnValue);
            }
        }

        return true; 
    }
 
    async  foreignKeyMissing(table, where, columnValue){
        try{
            let record = await this.dependencies.databasePrisma[table].findFirst({
                where: where
            });
            if(!record){
                throw this.dependencies.exceptionHandling.throwError(`Validation error: foreign key failed; no ${table} found with the value of ${columnValue}`, 404);
            }else{
                return true;
            }
        }catch(error){
            throw this.dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }
    }
   
    isValidDateFormat(dateString) {
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        return iso8601Regex.test(dateString);
    }

    async checkRecordOnUniqueField(tableName, fieldName, value) {
     
        const record = await this.dependencies.databasePrisma[tableName].findFirst({
            where: {
                [fieldName]: value
            }
        });
        return !!(record);
    }

    async checkRecordOnUniqueFieldOnUpdate(request, tableName, fieldName, value) {
       const record = await this.dependencies.databasePrisma[tableName].findFirst({
            where: {
                [fieldName]: value
            }
        });

        let userId = null;

        if(record){
            userId = record.id;
            
            if(record.id == request.id){
                return false;
            }
        }
        return !!(record);
    }

    validateList(table, query){
        try{

            const tableRules = fieldRules[table];
            const fields = Object.keys(tableRules.fields);

            for(let key in query){
                if (tableRules.fields[key].type === 'string' && typeof query[key].value !== 'string') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${key} must be a string`, 422);
                }
                if (tableRules.fields[key].type === 'number' && typeof query[key].value !== 'number') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${key} must be a number`, 422);
                }   
                if (tableRules.fields[key].type === 'boolean' && typeof query[key].value !== 'boolean') {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${key} must be a boolean`, 422);
                }
                if (tableRules.fields[key].type === 'date' && !this.isValidDateFormat(query[key].value)) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${key} must be in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"`, 422);
                }
                if (key === 'role' && !['admin', 'user', 'reception', 'mentainer'].includes(query[key].value)) {
                    throw this.dependencies.exceptionHandling.throwError(`Validation error: ${key} must be one of 'admin', 'user', 'mentainer' or 'reception'`, 422);
                }
            }

           
        }catch(error){
            console.log(error);
            if(error.statusCode){
                throw this.dependencies.exceptionHandling.throwError(error.message, error.statusCode);
            }else{
                throw this.dependencies.exceptionHandling.throwError(error.message, 500);
            } }
    }
    
} 


