const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);
const oneDay = 1000 * 60 * 60 * 24;

// Note: The application does not use session, but I still keep it for future reference
app.use(
  session({
    secret: "secret key",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
  })
);

// Set the default view and view engine
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

const routes = require("./server/routes/staffRoutes.js");
app.use("/", routes);

app.listen(port, () => console.log(`Listening to port ${port}...`));
