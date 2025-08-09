const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];
  if (!token) return res.status(403).json({ mssg: "Token missing!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      mssg: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
