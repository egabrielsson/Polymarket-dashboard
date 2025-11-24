// categories Routes
// Maps HTTP routes to category controller handlers
// And at /api/categories/:id for direct note operations

const express = require("express");
const {
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} = require("../controllers/categoryController");

const router = express.Router();

// POST /api/categories
router.post("/", createCategoryHandler);

// PUT /api/categories/:id
router.put("/:id", updateCategoryHandler);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategoryHandler);

module.exports = router;
