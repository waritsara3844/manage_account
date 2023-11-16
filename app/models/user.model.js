const sql = require("./db");
const jwt = require("jsonwebtoken");
const secret = require("../config/jwt.config");
const bcrypt = require("bcryptjs/dist/bcrypt");
const fs = require("fs");

const expireTime = "2h"; //token will expire in 2 hours

const User = function (user) {
  this.fullname = user.fullname;
  this.email = user.email;
  this.username = user.username;
  this.password = user.password;
  this.img = user.img;
};
User.checkUsername = (username, result) => {
  sql.query(
    "SELECT * FROM users WHERE username='" + username + "'",
    (err, res) => {
      if (err) {
        console.log("Error: " + err);
        result(err, null);
        return;
      }
      if (res.length) {
        console.log("Found username: " + res[0]);
        result(null, res[0]);
        return;
      }
      result({ kind: "not_found" }, null);
    }
  );
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("Query error: " + err);
      result(err, null);
      return;
    }
    const token = jwt.sign({ id: res.insertId }, secret.secret, {
      expiresIn: expireTime,
    });
    result(null, { id: res.insertId, ...newUser, accessToken: token });
    console.log(null, { id: res.insertId, ...newUser, accessToken: token });
  });
};

User.loginModel = (account, result) => {
  sql.query(
    "SELECT * FROM users WHERE username=?",
    [account.username],
    (err, res) => {
      if (err) {
        console.log("err:" + err);
        result(err, null);
        return;
      }
      if (res.length) {
        const validPassword = bcrypt.compareSync(
          account.password,
          res[0].password
        );
        if (validPassword) {
          const token = jwt.sign({ id: res.insertId }, secret.secret, {
            expiresIn: expireTime,
          });
          console.log("Login success. Token was generated." + token);
          res[0].accessToken = token;
          result(null, res[0]);
          return;
        } else {
          console.log("Password not match");
          result({ kind: "invalid_pass" }, null);
          return;
        }
      }
      return result({ kind: "not find" }, null);
    }
  );
};

User.getAllRecode = (result) => {
  sql.query("SELECT * FROM users", (error, res) => {
    if (error) {
      console.log("Query err: " + error);
      result(error, null);
      return;
    }
    result(null, res);
  });
};
// var let => function scope do it inside scope
const removeOldImage = (id, result) => {
  sql.query("SELECT * FROM users WHERE id=?", [id], (err, res) => {
    if (err) {
      console.log("error:" + err);
      result(err, null);
      return;
    }
    if (res.length) {
      let filePath = __basedir + "/assets/" + res[0].img;
      try {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (e) {
              console.log("Error: " + e);
              return;
            } else {
              console.log("File: " + res[0].img + "was removed");
              return;
            }
          });
        } else {
          console.log("File: " + res[0].img + "not found");
        }
      } catch (error) {
        console.log(error);
        return;
      }
    }
  });
};

User.updateUser = (id, data, result) => {
  removeOldImage(id);
  console.log(JSON.stringify(data));
  sql.query(
    `UPDATE users
    SET fullname = '${data.fullname}', email = '${data.email}', img = '${data.img}'
    WHERE id = ${id}`,
    (err, res) => {
      if (err) {
        console.log("Error: " + err);
        result(err, null);
        return;
      }
      //no recode
      if (res.affectedRows === 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("Update user: " + { id: id, ...data });

      return result(null, { id: id, ...data });
    }
  );
};
User.removeUser = (id, result) => {
  removeOldImage(id);
  sql.query("DELETE FROM users WHERE id=?", [id], (err, res) => {
    if (err) {
      console.log("Query error" + err);
      result(err, null);
      return;
    }
    if (res.affectedRows == 0) {
      //found any recode or not
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("Removed User with ID:" + id);
    result(null, { id: id });
  });
};
module.exports = User;
