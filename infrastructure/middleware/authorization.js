const Roles = require("../../Interface/Roles");

const {Ability, AbilityBuilder} = require("@casl/ability");


module.exports = function(user) {

    const builder = new AbilityBuilder(Ability);

    if(user.Roles.includes(Roles.Admin)) {

        builder.can("create", "user");
        builder.can("read", "user");
        builder.can("update", "user");
        builder.can("delete", "user");

        builder.can("create", "choice");
        builder.can("read", "choice");
        builder.can("update", "choice");
        builder.can("delete", "choice");

        builder.can("create", "book");
        builder.can("read", "book");
        builder.can("update", "book");
        builder.can("delete", "book");

        
        builder.can("create", "bookupload");
        builder.can("read", "bookupload");
        builder.can("update", "bookupload");
        builder.can("delete", "bookupload");

        builder.can("create", "basequesionary");
        builder.can("read", "basequesionary");
        builder.can("update", "basequesionary");
        builder.can("delete", "basequesionary");

        builder.can("create", "quesionary");
        builder.can("read", "quesionary");
        builder.can("update", "quesionary");
        builder.can("delete", "quesionary");
        
        builder.can("create", "questionanswer");
        builder.can("read", "questionanswer");
        builder.can("update", "questionanswer");
        builder.can("delete", "questionanswer");
        
        builder.can("create", "rent");
        builder.can("read", "rent");
        builder.can("update", "rent");
        builder.can("delete", "rent");

    } else if(user.Roles.includes(Roles.Owner)) {

        builder.cannot("create", "user");
        builder.can("read", "user");
        builder.can("update", "user");
        builder.cannot("delete", "user");
        
        builder.cannot("create", "choice");
        builder.can("read", "choice");
        builder.cannot("update", "choice");
        builder.cannot("delete", "choice");
        
        builder.can("create", "book");
        builder.can("read", "book");
        builder.can("update", "book");
        builder.can("delete", "book");
        
        builder.can("create", "bookupload");
        builder.can("read", "bookupload");
        builder.can("update", "bookupload");
        builder.can("delete", "bookupload");
        
        builder.can("create", "basequesionary");
        builder.can("read", "basequesionary");
        builder.can("update", "basequesionary");
        builder.can("delete", "basequesionary");

        builder.can("read", "quesionary");

        // builder.can("create", "questionanswer");
        builder.can("read", "questionanswer");
        // builder.can("update", "questionanswer");
        // builder.can("delete", "questionanswer");
        
        // builder.can("create", "rent");
        builder.can("read", "rent");
        builder.can("update", "rent", ["status"]);
        // builder.can("delete", "rent");

    }  else if(user.Roles.includes(Roles.User)) {

        builder.cannot("create", "user");
        builder.can("read", "user", { id: user.Id });
        builder.cannot("update", "user");
        builder.cannot("delete", "user");

        builder.can("read", "choice");

        builder.can("read", "book");

        builder.can("read", "bookupload");

        builder.can("read", "basequesionary");

        builder.can("read", "quesionary");
        
        builder.can("create", "questionanswer");
        builder.can("read", "questionanswer");

        builder.can("create", "rent");
        builder.can("read", "rent");
        builder.can("update", "rent");

    } else {
        builder.cannot("create", "user");
    }

    return builder.build();
}