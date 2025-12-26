require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 3001;



console.log("🚀 Server starting...");

app.listen(port, () => {
    require("./jobs/scheduler");
    console.log(`✅ API running on http://localhost:${port}`);
});