const fieldRules = require('../configuration/fieldRules.json');

class FieldsMapper {

    static mapFields(data, table_name) {

        let new_data = {};
        let fields = Object.keys(fieldRules[table_name].fields);

        fields.forEach(field => {
            if(data[field]) {
                new_data[field] = data[field];
            }
        });

        return new_data;

    }

    static identifyChanges(old_data, new_data) {

        let fields = Object.keys(old_data);
        let changes = [];

        fields.forEach(element => {
            if(!old_data[element] || !new_data[element] || old_data[element] != new_data[element]) {
                changes.push({
                    column: element,
                    new_value: new_data[element],
                    old_value: old_data[element]
                });
            }

        });

        return changes;

    }
}

module.exports = FieldsMapper;