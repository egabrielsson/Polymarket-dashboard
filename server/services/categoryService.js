
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

  // Ownership rule:
  // • If category.userId exists, user must match.
  // • If category.userId is null → global category → can’t update.
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

async function deleteCategory(userId, categoryId, name){
    if (!name) {
        const err = new Error("Category name is required");
        err.status = 400;
        throw err;
    }
    const category = await Category.findById(categoryId);
        if (!category) {
            const err = new Error("Catagory not found");
            err.status = 404;
            throw err;
        }
  // Ownership rule:
  // • If category.userId exists, user must match.
  // • If category.userId is null → global category → can’t update.
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

    await createCategory.deleteOne({_id: categoryId});
}



module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
};