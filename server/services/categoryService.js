
const mongoose = require("mongoose");
const Category = require("../models/Category");

async function listCategories(userId) {
    const query = {};
    if (userId) {
        const normalizedUserId = await normalizeUserId(userId);
        query.$or = [
            { userId: normalizedUserId },
            { userId: null }
        ];
    }
    return await Category.find(query).sort({ createdAt: 1 }).lean().exec();
}

async function normalizeUserId(userId) {
    if (!userId) {
        return null;
    }
    // Check if userId is a 16-char external ID or MongoDB ObjectId
    if (userId.length === 16 && !mongoose.Types.ObjectId.isValid(userId)) {
        // It's an external 16-char user ID, need to convert to MongoDB ObjectId
        const User = require("../models/User");
        const user = await User.findOne({ characterString: userId }).exec();
        if (!user) {
            const err = new Error("User not found");
            err.code = 'NOT_FOUND';
            throw err;
        }
        return user._id;
    } else if (mongoose.Types.ObjectId.isValid(userId)) {
        // It's already a MongoDB ObjectId
        return new mongoose.Types.ObjectId(userId);
    } else {
        const err = new Error("Invalid userId");
        err.code = 'BAD_REQUEST';
        throw err;
    }
}

// Create a category
// If userId is provided, it's user-owned; if null, it's a global category
async function createCategory(userId, name) {
    if (!name) {
        const err = new Error("Category name is required");
        err.code = 'BAD_REQUEST';
        throw err;
    }
    const normalizedUserId = await normalizeUserId(userId);
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

    const normalizedUserId = await normalizeUserId(userId);
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
    const normalizedUserId = await normalizeUserId(userId);
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

/**
 * Get or find a user's "Tech" category by external user ID (16-char characterString)
 * This is used when adding markets to ensure they get assigned to the Tech category
 */
async function getUserTechCategory(externalUserId) {
    const User = require("../models/User");
    const user = await User.findOne({ characterString: externalUserId }).exec();
    
    if (!user) {
        const err = new Error("User not found");
        err.code = 'NOT_FOUND';
        throw err;
    }

    // Find the user's Tech category
    const techCategory = await Category.findOne({ 
        userId: user._id, 
        name: "Tech" 
    }).exec();

    if (!techCategory) {
        // If Tech category doesn't exist, create it (for existing users who didn't get one)
        return await createCategory(user._id, "Tech");
    }

    return techCategory;
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserTechCategory,
};