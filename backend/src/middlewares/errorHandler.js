const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err);

    // Erreur PostgreSQL (duplicate, foreign key, etc.)
    if (err.code === '23505') {
        return res.status(409).json({ error: "Resource already exists" });
    }

    if (err.code === '23503') {
        return res.status(400).json({ error: "Invalid reference" });
    }

    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: "Invalid token" });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token expired" });
    }

    // Erreur par défaut
    res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };