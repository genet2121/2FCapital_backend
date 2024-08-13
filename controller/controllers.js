
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
const CreateBookUpload = require("./bookupload/CreateBookUpload");
const UpdateBookUpload = require("./bookupload/UpdateBookUpload");
const DeleteBookUpload = require("./bookupload/DeleteBookUpload");
const GetBookUpload = require("./bookupload/GetBookUpload");
const ListBookUpload = require("./bookupload/ListBookUpload");
const CreateQuestionary = require("./questionary/CreateQuestionary");
const UpdateQuestionary = require("./questionary/UpdateQuestionary");
const GetQuestionary = require("./questionary/GetQuestionary");
const DeleteQuestionary = require("./questionary/DeleteQuestionary");
const ListQuestionary = require("./questionary/ListQuestionary");
const ListQuestionaryAnswer = require("./questionaryanswer/ListQuestionaryAnswer");
const CreateBaseQuestionary = require("./basequestionary/CreateBaseQuestionary");
const UpdateBaseQuestionary = require("./basequestionary/UpdateBaseQuestionary");
const DeleteBaseQuestionary = require("./basequestionary/DeleteBaseQuestionary");
const ListBaseQuestionary = require("./basequestionary/ListBaseQuestionary");
const GetBaseQuestionary = require("./basequestionary/GetBaseQuestionary");
const CreateRent = require("./rent/CreateRent");
const UpdateRent = require("./rent/UpdateRent");
const DeleteRent = require("./rent/DeleteRent");
const GetRent = require("./rent/GetRent");
const ListRent = require("./rent/ListRent");


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
        bookupload: {
            create: CreateBookUpload,
            update: UpdateBookUpload,
            delete: DeleteBookUpload,
            get: GetBookUpload,
            getList: ListBookUpload
        },
        questionary: {
            create: CreateQuestionary,
            update: UpdateQuestionary,
            delete: DeleteQuestionary,
            get: GetQuestionary,
            getList: ListQuestionary
        },
        questionaryanswer: {
            getList: ListQuestionaryAnswer
        },
        basequestionary: {
            create: CreateBaseQuestionary,
            update: UpdateBaseQuestionary,
            delete: DeleteBaseQuestionary,
            get: GetBaseQuestionary,
            getList: ListBaseQuestionary
        },
        rent: {
            create: CreateRent,
            update: UpdateRent,
            delete: DeleteRent,
            get: GetRent,
            getList: ListRent
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
