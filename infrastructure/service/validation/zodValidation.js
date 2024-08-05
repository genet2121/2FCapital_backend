module.exports = (schema, data) => {

    let validated = schema.safeParse(data);
    if(!validated.success) {

        // console.log("validation result ", validated.error.issues);
        let error_messages = [];
        validated.error.issues.forEach(issue => {
            error_messages.push(`${issue.path[0]}: ${issue.message}`);
        });

        throw dependencies.exceptionHandling.throwError(error_messages.join(", "), 500);

    }

}