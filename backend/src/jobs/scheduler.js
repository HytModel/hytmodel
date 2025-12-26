const { cleanupSoftDeletedModels } = require("./cleanupSoftDeletedModels");

// toutes les 24h
setInterval(() => {
    cleanupSoftDeletedModels().catch(console.error);
}, 24 * 60 * 60 * 1000);

// exécution au démarrage (optionnel)
cleanupSoftDeletedModels().catch(console.error);