const {Ability, AbilityBuilder} = require("@casl/ability");


export default function(user) {

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
        builder.can("read", "user", { id: user.Id });
        builder.can("update", "user", { id: user.Id });
        builder.cannot("delete", "user");
        
        builder.cannot("create", "choice");
        builder.can("read", "choice");
        builder.cannot("update", "choice");
        builder.cannot("delete", "choice");
        
        builder.can("create", "book", { owner_id: user.Id });
        builder.can("read", "book", { owner_id: user.Id });
        builder.can("update", "book", { owner_id: user.Id });
        builder.can("delete", "book", { owner_id: user.Id });
        
        builder.can("create", "bookupload", { owner_id: user.Id });
        builder.can("read", "bookupload", { owner_id: user.Id });
        builder.can("update", "bookupload", { owner_id: user.Id });
        builder.can("delete", "bookupload", { owner_id: user.Id });
        
        builder.can("create", "basequesionary", { created_by: user.Id });
        builder.can("read", "basequesionary", { created_by: user.Id });
        builder.can("update", "basequesionary", { created_by: user.Id });
        builder.can("delete", "basequesionary", { created_by: user.Id });

        builder.can("read", "quesionary");

        // builder.can("create", "questionanswer");
        builder.can("read", "questionanswer");
        // builder.can("update", "questionanswer");
        // builder.can("delete", "questionanswer");
        
        // builder.can("create", "rent");
        builder.can("read", "rent");
        builder.can("update", "rent", ["status"], { owner_id: user.Id });
        // builder.can("delete", "rent");

    }  else {

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

    }

    return builder.build();
}