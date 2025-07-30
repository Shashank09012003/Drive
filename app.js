const express = require("express");
const userRouter = require("./routes/user.routes");
const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db");
connectToDB();
const cookieParser = require("cookie-parser");
const app = express();
const indexRouter = require("./routes/index.routes");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/", indexRouter);
app.use("/user", userRouter);

app.listen(3000, () => {
  console.log("Server is running on port 300o");
});
