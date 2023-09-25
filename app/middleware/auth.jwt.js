const jwt = require("jsonwebtoken");
const secret = require("../config/jwt.config");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No Token Provided" });
  }
  jwt.verify(token, secret.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: err });
    }
    req.id = decoded.id;
    next();
  });
};

module.exports = verifyToken;
