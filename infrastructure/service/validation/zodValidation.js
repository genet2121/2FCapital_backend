function ZodValidation (schema, data, dependencies) {

    let validated = schema.safeParse(data);
    if(!validated.success) {

        let error_messages = [];
        validated.error.issues.forEach(issue => {
            error_messages.push(`${issue.path[0]}: ${issue.message}`);
        });

        throw dependencies.exceptionHandling.throwError(error_messages.join(", "), 500);

    }

    return true;

}

module.exports = ZodValidation;