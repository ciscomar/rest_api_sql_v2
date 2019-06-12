const express = require("express");
const router = express.Router();
const User = require("../models").User;
const authenticate = require("./authenticate");
const bcryptjs = require("bcryptjs");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

//Get logged in user information
router.get("/", authenticate, (req, res) => {
  res.status(200);
//Send user information
  res.json({
    id: req.currentUser.id,
    firstName: req.currentUser.firstName,
    lastName: req.currentUser.lastName,
    emailAddress: req.currentUser.emailAddress
  });
});

//Create new user
router.post("/", (req, res) => {
  //Check if email is already registered
  User.findOne({ where: { emailAddress: req.body.emailAddress } })
    .then(user => {

      if (!user) {
        req.body.password = bcryptjs.hashSync(req.body.password);
        //Create User
        User.create(req.body)
          .then(() => {
            res
              .location("/users")
              .status(200)
              .json({
                message: "User Created Succesfully",
                Name: req.body.firstName,
                lastName: req.body.lastName,
              });
          })
          .catch(e => {
            res.status(500).json({ Error: e });
          });
      } else {
        res.status(400).json({ Message: "User is already registered" });
      }
    })
    .catch(e => {
      res
        .status(400)
        .json({ Error: "Please fill in the required Information" });
    });
});

module.exports = router;
