
const CreateUser = require("./user/CreateUser");
const UpdateUser = require("./user/UpdateUser");
const DeleteUser = require("./user/DeleteUser");
const GetUser = require("./user/GetUser");
const ListUser = require("./user/ListUser");
const CreateAttachment = require("./attachment/CreateAttachment");
const UpdateAttachment = require("./attachment/UpdateAttachment");
const ListAttachment = require("./attachment/ListAttachment");
const getAttachment = require("./attachment/GetAttachment");
const DeleteAttachment = require("./attachment/DeleteAttachment");


module.exports = function (dependencies) {

    return {
        user: {
            create: CreateUser,
            update: UpdateUser,
            delete: DeleteUser,
            get: GetUser,
            getList: ListUser
        },
        attachment: {
            create: CreateAttachment,
            update: UpdateAttachment,
            delete: DeleteAttachment,
            get: getAttachment,
            getList: ListAttachment
        },
    };

}
