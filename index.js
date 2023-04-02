require("./models/").sequelize;

const Express = require('express');
const cors = require('cors');
const router = require("./routes")

const app = Express();
app.use(cors());
app.use(Express.json());

app.use("/", router);

app.listen(8092, () => {
    console.log("Server running at port 8092");
});

// Exports the Express App to be used as a serverless application
//module.exports = app;
