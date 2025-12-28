const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                params: req.params,
                query: req.query
            });
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors
            });
        }
    };
};

module.exports = { validateRequest };