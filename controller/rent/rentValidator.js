
const { z } = require('zod');

module.exports = {
    create: z.object({
        status: z.string().min(3, { message: "type should at least be 3 character long" }).max(30, { message: "type should maximum be 30 characters long" }),
        quantity: z.number().nonnegative(),
        total_price: z.number().nonnegative(),
        upload_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        answers: z.array(z.object({
            id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
            answer: z.string().min(1, { message: "type should at least be 1 character long" })
        }))
    }),
    update: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }).optional(),
        status: z.string().min(3, { message: "type should at least be 3 character long" }).max(30, { message: "type should maximum be 30 characters long" }),
        quantity: z.number().nonnegative(),
        total_price: z.number().nonnegative(),
        upload_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        answers: z.array(z.object({
            id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
            answer: z.string().min(1, { message: "type should at least be 1 character long" })
        }))
    })
}