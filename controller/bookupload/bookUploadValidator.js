const { z } = require('zod');
const Active = ["true", "false"];

module.exports = {
    create: z.object({
        status: z.enum(Active),
        quantity: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        price: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        book_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        book_cover: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        questionaries: z.array(z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }))
    }),
    update: z.object({
        id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        status: z.enum(Active),
        quantity: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        price: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        book_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        book_cover: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" }),
        questionaries: z.array(z.number().nonnegative().gt(0, { message: "id must be greater than 0!" })),
        // owner_id: z.number().nonnegative().gt(0, { message: "id must be greater than 0!" })
    })
}