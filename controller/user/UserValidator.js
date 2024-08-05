
const { z } = require('zod');

const Roles = ["admin", "user", "owner"];

module.exports = {
    create: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }).optional(),
        email: z.string().email().min(6, { message: "email should at least be 6 character long" }),
        name: z.string().min(3, { message: "name should at least be 3 characters long" }).min(50, { message: "name should maximum be 50 characters long" }),
        password: z.string().min(6, { message: "password should at least be 6 characters long" }).min(100, { message: "password should maximum be 100 characters long" }),
        phone: z.string().min(10, { message: "phone should at least be 3 characters long" }).min(13, { message: "phone should maximum be 13 characters long" }),
        type: z.enum(Roles),
        Status: z.boolean({
            required_error: "Status is required",
            invalid_type_error: "Status must be a boolean",
        }),
        location: z.string().min(3, { message: "location should at least have 3 characters long" }).min(50, { message: "location should maximum be 50 characters long" }),
        Approved: z.boolean({
            required_error: "Approved is required",
            invalid_type_error: "Approved must be a boolean",
        })
    })
}