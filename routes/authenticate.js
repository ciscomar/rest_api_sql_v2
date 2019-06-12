"use strict";

const User = require("../models").User;
const authenticate = require("basic-auth");
const bcryptjs = require("bcryptjs");

//Autheticate User 
module.exports = (req, res, next) => {
  const info= authenticate(req);

  let message = null;
  if (info) {
    //Find user with email
    User.findOne({ where: { emailAddress: info.name } })
      .then(user => {
        if (user) {
          const authenticated = bcryptjs.compareSync(
            info.pass,
            user.password
          );
          if (authenticated) {
            req.currentUser = user;
          } else {
            message = ` ${user.emailAddress} Password is Incorrect`;
          }
        } else {
          message = `User ${info.name} not found`;
        }
      })
      .catch(e => {
        res.status(500).json({ Error: e });
      })
      .then(() => {
        if (message) {
          res.status(401).json({ message: message });
        } else {
          next();
        }
      });
  } else {
    res.status(401).json({ message: "Please log in" });
  }
};
