const authJwt = require("../middleware/auth.jwt");

module.exports = (app) => {
  const user_controller = require("../controllers/user.controller");
  var router = require("express").Router();
  router.get("/:us", user_controller.validUsername);
  router.post("/signup", user_controller.createNewUser);
  router.post("/login", user_controller.loginAccount);
  router.get("/", authJwt, user_controller.getAllUser);
  router.put("/:id", authJwt, user_controller.updateUserCtrl);
  router.delete("/:id", authJwt, user_controller.deleteUser);
  app.use("/api/auth", router);
};
