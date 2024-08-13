
const { z } = require('zod');

module.exports = {
    create: z.object({
        category: z.string().min(3, { message: "category should at least be 3 character long" }).max(30, { message: "category should maximum be 30 characters long" }),
        name: z.string().min(3, { message: "name should at least be 3 characters long" }).max(50, { message: "name should maximum be 50 characters long" }),
        author: z.string().min(3, { message: "author name should at least be 3 characters long" }).max(50, { message: "author name should maximum be 50 characters long" }),
    }),
    update: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }).optional(),
        category: z.string().min(3, { message: "category should at least be 3 character long" }).max(30, { message: "category should maximum be 30 characters long" }),
        name: z.string().min(3, { message: "name should at least be 3 characters long" }).max(50, { message: "name should maximum be 50 characters long" }),
        author: z.string().min(3, { message: "author name should at least be 3 characters long" }).max(50, { message: "author name should maximum be 50 characters long" }),
    })
}