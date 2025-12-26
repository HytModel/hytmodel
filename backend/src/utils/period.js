function parsePeriod(query) {
    const period = (query.period || "30d").toString();

    // formats: 7d | 30d | 90d
    const m = period.match(/^(\d+)(d)$/i);
    if (m) {
        const days = Math.max(1, Math.min(3650, parseInt(m[1], 10)));
        return { days };
    }

    // fallback
    return { days: 30 };
}

module.exports = { parsePeriod };