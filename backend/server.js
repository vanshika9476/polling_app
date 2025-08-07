const express = require("express");
const userRouter = require("./routes/auth");
const db = require("./initializer/db");
const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api/v1", userRouter);

app.listen(PORT, () => {
  console.log("Server is listening on port: ", PORT);
});
