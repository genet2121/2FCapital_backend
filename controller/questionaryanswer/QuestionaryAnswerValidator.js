
const { z } = require('zod');

module.exports = {
    create: z.object({
        question_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        answer: z.string().min(1, { message: "value should at least be 1 characters long" }).max(100, { message: "value should maximum be 100 characters long" }),
        rent_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" })
    })
}