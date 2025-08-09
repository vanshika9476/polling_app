const express = require("express");
const { signIn, signUp } = require("../controllers/userController");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);

const userRouter = router;
module.exports = userRouter;
