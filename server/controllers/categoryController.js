// Category Controller
// Handles HTTP requests for Category endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

const {
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../services/categoryService");

// Create a new category for a user
// If no userId is provided, creates a global category
async function createCategoryHandler(req, res) {
    try {
        const userId = req.user?._id || null;
        const { name } = req.body;

        const category = await createCategory(userId, name);

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (err) {
        if (err && err.code === 'BAD_REQUEST') {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error creating category:", err);
        return res.status(500).json({ error: "Failed to create category" });
    }
}

// Update a category's name
// Only the category owner can update it
async function updateCategoryHandler(req, res) {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const { name } = req.body;

        const category = await updateCategory(userId, id, name);

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (err) {
        if (err && err.code === 'BAD_REQUEST') {
            return res.status(400).json({ error: err.message });
        }
        if (err && err.code === 'NOT_FOUND') {
            return res.status(404).json({ error: err.message });
        }
        if (err && err.code === 'FORBIDDEN') {
            return res.status(500).json({ error: err.message });
        }
        console.error("Error updating category:", err);
        return res.status(500).json({ error: "Failed to update category" });
    }
}

// Delete a category
// Only the category owner can delete it
async function deleteCategoryHandler(req, res) {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        await deleteCategory(userId, id);

        return res.status(200).send();
    } catch (err) {
        if (err && err.code === 'NOT_FOUND') {
            return res.status(404).json({ error: err.message });
        }
        if (err && err.code === 'FORBIDDEN') {
            return res.status(500).json({ error: err.message });
        }
        console.error("Error deleting category:", err);
        return res.status(500).json({ error: "Failed to delete category" });
    }
}

// Export the handlers
module.exports = {
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
};
