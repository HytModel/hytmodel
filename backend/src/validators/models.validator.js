// Note: Zod est déjà installé dans ton package.json (voir dependencies)
const z = require("zod");

const MIN_MODEL_PRICE = 5;

const uploadModelSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().optional(),
        price: z.string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val >= MIN_MODEL_PRICE, {
                message: "Minimum price is " + MIN_MODEL_PRICE + "€"
            })
    })
});

const updateModelSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Invalid model ID")
    }),
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        price: z.number().min(MIN_MODEL_PRICE).optional()
    })
});

const rateModelSchema = z.object({
    params: z.object({
        id: z.string().min(1)
    }),
    body: z.object({
        rating: z.number().int().min(1).max(5)
    })
});

module.exports = {
    uploadModelSchema,
    updateModelSchema,
    rateModelSchema
};