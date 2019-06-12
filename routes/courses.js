const express = require("express");
const router = express.Router();
const Course = require("../models").Course;
const User = require("../models").User;
const authenticate = require("./authenticate");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

//Get all courses
router.get("/", (req, res) => {
  
  Course.findAll()
    .then(data => res.json(data))
    .catch(err => res.status(400).json(err));
});

//Get course by Id
router.get("/:id", (req, res) => {

  Course.findOne({ where: { id: req.params.id } })
    .then(course => {
      if (course) {
        res.status(200).json({ message: "Course Found Successfully", course });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    })
    .catch(error => {
      res.send(500, error);
    });
});

// Post new Course
router.post("/", authenticate, (req, res) => {

  if (!req.body.title || !req.body.description) {
    res.status(400).json({ message: "Course Title/Description is Required" });
  } else {
    Course.findByPk(req.body.id)
      .then(course => {
        User.findByPk(req.body.userId)
          .then(userId => {
            if (course) {
              res.status(403).json({ message: "Id already Exists" });
            } else if (req.body) {
              Course.create(req.body)
                .then(() => {
                  res
                    .location("/courses/" + req.body.id)
                    .status(201)
                    .json({ message: "New Course added successfully",
                    Title: req.body.title,
                    Description: req.body.description,
                  });
                })
                .catch(e => {
                  res.status(500).json({ Error: e });
                });
            } else if (!userId) {
              res.status(400).json({ message: "User Not Found" });
            }
          })
          .catch(e => {
            res.status(500).json({ Error: e });
          });
      })
      .catch(e => {
        res.status(500).json({ Error: e });
      });
  }
});

// Update Course
router.put("/:id", authenticate, (req, res) => {

  if (!req.body.title || !req.body.description) {
    res.status(400).json({ message: "Course Title/Description is Required to Update" });
  } else{
  Course.findByPk(req.params.id)
    .then(course => {

      if (course) {
        User.findByPk(course.userId)
          .then(data => {
            if (data.id === req.body.userId) {
              course.update(req.body).userId;
              res
                .location("/courses/" + req.body.id)
                .status(201)
                .json({ message: "Course updated successfully",
                Id: req.params.id,
                NewTitle: req.body.title,
                NewDescripction: req.body.description
              });
            } else {
              res
                .status(401)
                .json({ Error: "This Course was not created by current user" });
            }
          })
          .catch(e => {
            res.status(500).json({ Error: e });
          });
      } else {
        res.status(403).json({ message: "Course does not exist" });
      }
    })
    .catch(e => {
      res.status(500).json({ Error: e });
    });
  }
});

// Delete course
router.delete("/:id", authenticate, (req, res) => {

  Course.findByPk(req.params.id)
    .then(course => {
      if (course) {
        User.findByPk(course.userId)
          .then(data => {

            if (data.id === req.currentUser.id) {
              course.destroy();
              res.status(201).json({ message: "Course Deleted" });
            } else {
              res.status(401).json({
                Error: "This course was not created by current User"
              });
            }
          })
          .catch(e => {
            res.status(500).json({ Error: e });
          });
      } else {
        res
          .status(403)
          .json({ message: "Course does not exist" });
      }
    })
    .catch(e => {
      res.status(500).json({ Error: e });
    });
});

module.exports = router;
