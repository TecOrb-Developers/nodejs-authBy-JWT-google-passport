const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const passport = require('passport');
const mongoose = require("mongoose");
const googleAuth = require("./routes/authentication.js");
const jwt = require('jsonwebtoken');

require("./controllers/controller.tokenJWT");
require("dotenv/config");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/auth", googleAuth);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

app.listen(process.env.PORT || 3000, () => {
    console.log(`Running app on port ${process.env.PORT || "3000"}`);
});