
const { z } = require('zod');

module.exports = {
    create: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }).optional(),
        type: z.string().min(3, { message: "type should at least be 3 character long" }).max(30, { message: "type should maximum be 30 characters long" }),
        question: z.string().min(3, { message: "label should at least be 3 characters long" }).max(50, { message: "label should maximum be 50 characters long" }),
        name: z.string().min(1, { message: "value should at least be 1 characters long" }).max(50, { message: "value should maximum be 30 characters long" }),
        upload_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" })
    })
}