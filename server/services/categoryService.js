
const Category = require("../models/Category");

/**
 * Create a category. If userId is provided -> user-owned category.
 * If userId is null -> global category.
 */
async function createCategory(userId, name) {
  if (!name) {
    const err = new Error("Category name is required");
    err.status = 400;
    throw err;
  }
    const category = await Category.create({ name, userId: userId || null });
  return category;
}