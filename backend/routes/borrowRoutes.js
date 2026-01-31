const express = require("express");
const router = express.Router();
const controller = require("../controllers/borrowController");
const { isUser } = require("../middleware/roleMiddleware");

router.post("/", isUser, controller.borrowBook);

module.exports = router;
