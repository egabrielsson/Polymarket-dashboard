
const mongoose = require("mongoose");
const Category = require("../models/Category");

async function listCategories(userId) {
    const query = {};
    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const err = new Error("Invalid userId");
            err.code = 'BAD_REQUEST';
            throw err;
        }
        const normalizedUserId = new mongoose.Types.ObjectId(userId);
        query.$or = [
            { userId: normalizedUserId },
            { userId: null }
        ];
    }
    return await Category.find(query).sort({ createdAt: 1 }).lean().exec();
}

function normalizeUserId(userId) {
    if (!userId) {
        return null;
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new Error("Invalid userId");
        err.code = 'BAD_REQUEST';
        throw err;
    }
    return new mongoose.Types.ObjectId(userId);
}

// Create a category
// If userId is provided, it's user-owned; if null, it's a global category
async function createCategory(userId, name) {
    if (!name) {
        const err = new Error("Category name is required");
        err.code = 'BAD_REQUEST';
        throw err;
    }
    const normalizedUserId = normalizeUserId(userId);
    const category = await Category.create({ name, userId: normalizedUserId });
    return category;
}

// Update a category's name
// Only user-owned categories can be updated, not global ones
async function updateCategory(userId, categoryId, name) {
    if (!name) {
        const err = new Error("Category name is required");
        err.code = 'BAD_REQUEST';
        throw err;
    }

    const normalizedUserId = normalizeUserId(userId);
    const category = await Category.findById(categoryId);
        if (!category) {
            const err = new Error("Category not found");
            err.code = 'NOT_FOUND';
            throw err;
        }

    // Check ownership: user-owned categories can only be edited by their owner
    // Global categories (userId is null) cannot be edited
    if (category.userId) {
            if (!normalizedUserId || category.userId.toString() !== normalizedUserId.toString()) {
                const err = new Error("You do not own this category");
                err.code = 'FORBIDDEN';
                throw err;
            }
        } else {
            const err = new Error("Global categories cannot be edited");
            err.code = 'FORBIDDEN';
            throw err;
        }

    category.name = name;
    return await category.save();
}

// Delete a category
// Only user-owned categories can be deleted, not global ones
async function deleteCategory(userId, categoryId) {
    const normalizedUserId = normalizeUserId(userId);
    const category = await Category.findById(categoryId);
        if (!category) {
            const err = new Error("Category not found");
            err.code = 'NOT_FOUND';
            throw err;
        }
  // Check ownership: user-owned categories can only be deleted by their owner
  // Global categories (userId is null) cannot be deleted
        if (category.userId) {
            if (!normalizedUserId || category.userId.toString() !== normalizedUserId.toString()) {
                const err = new Error("You do not own this category");
                err.code = 'FORBIDDEN';
                throw err;
            }
            } else {
            const err = new Error("Global categories cannot be deleted");
            err.code = 'FORBIDDEN';
            throw err;
        }

    await Category.findByIdAndDelete(categoryId);
}



module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};