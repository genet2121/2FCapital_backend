
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
const CreateBook = require("./book/CreateBook");
const CreateChoice = require("./choice/CreateChoice");
const UpdateBook = require("./book/UpdateBook");
const DeleteBook = require("./book/DeleteBook");
const GetBook = require("./book/GetBook");
const ListBook = require("./book/ListBook");
const UpdateChoice = require("./choice/UpdateChoice");
const DeleteChoice = require("./choice/DeleteChoice");
const GetChoice = require("./choice/GetChoice");
const ListChoice = require("./choice/ListChoice");


module.exports = function (dependencies) {

    return {
        user: {
            create: CreateUser,
            update: UpdateUser,
            delete: DeleteUser,
            get: GetUser,
            getList: ListUser
        },
        book: {
            create: CreateBook,
            update: UpdateBook,
            delete: DeleteBook,
            get: GetBook,
            getList: ListBook
        },
        choice: {
            create: CreateChoice,
            update: UpdateChoice,
            delete: DeleteChoice,
            get: GetChoice,
            getList: ListChoice
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
