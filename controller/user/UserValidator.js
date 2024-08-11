
const { z } = require('zod');

const Roles = ["admin", "user", "owner"];
const Active = ["true", "false"];

module.exports = {
    create: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }).optional(),
        email: z.string().email().min(6, { message: "email should at least be 6 character long" }),
        name: z.string().min(3, { message: "name should at least be 3 characters long" }).max(50, { message: "name should maximum be 50 characters long" }),
        password: z.string().min(6, { message: "password should at least be 6 characters long" }).max(100, { message: "password should maximum be 100 characters long" }),
        phone: z.string().min(10, { message: "phone should at least be 10 characters long" }).max(13, { message: "phone should maximum be 13 characters long" }),
        type: z.enum(Roles),
        Status: z.enum(Active).optional(),
        location: z.string().min(3, { message: "location should at least have 3 characters long" }).max(50, { message: "location should maximum be 50 characters long" }),
        Approved: z.enum(Active).optional()
    })
}