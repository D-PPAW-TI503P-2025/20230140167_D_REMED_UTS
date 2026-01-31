const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookController");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/", controller.getAllBooks);
router.get("/:id", controller.getBookById);
router.post("/", isAdmin, controller.createBook);
router.put("/:id", isAdmin, controller.updateBook);
router.delete("/:id", isAdmin, controller.deleteBook);

module.exports = router;
