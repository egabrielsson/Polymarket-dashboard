
const Category = require("../models/Category");

// Create a category
// If userId is provided, it's user-owned; if null, it's a global category
async function createCategory(userId, name) {
    if (!name) {
        const err = new Error("Category name is required");
        err.status = 400;
        throw err;
    }
    const category = await Category.create({ name, userId: userId || null });
    return category;
}

// Update a category's name
// Only user-owned categories can be updated, not global ones
async function updateCategory(userId, categoryId, name) {
    if (!name) {
        const err = new Error("Category name is required");
        err.status = 400;
        throw err;
    }

    const category = await Category.findById(categoryId);
        if (!category) {
            const err = new Error("Category not found");
            err.status = 404;
            throw err;
        }

    // Check ownership: user-owned categories can only be edited by their owner
    // Global categories (userId is null) cannot be edited
    if (category.userId) {
            if (category.userId.toString() !== userId.toString()) {
                const err = new Error("You do not own this category");
                err.status = 403;
                throw err;
            }
        } else {
            const err = new Error("Global categories cannot be edited");
            err.status = 403;
            throw err;
        }

    category.name = name;
    return await category.save();
}

// Delete a category
// Only user-owned categories can be deleted, not global ones
async function deleteCategory(userId, categoryId) {
    const category = await Category.findById(categoryId);
        if (!category) {
            const err = new Error("Category not found");
            err.status = 404;
            throw err;
        }
  // Check ownership: user-owned categories can only be deleted by their owner
  // Global categories (userId is null) cannot be deleted
        if (category.userId) {
            if (category.userId.toString() !== userId.toString()) {
                const err = new Error("You do not own this category");
                err.status = 403;
                throw err;
            }
            } else {
            const err = new Error("Global categories cannot be deleted");
            err.status = 403;
            throw err;
        }

    await Category.findByIdAndDelete(categoryId);
}



module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
};