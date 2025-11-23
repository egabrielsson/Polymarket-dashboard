const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");

async function createCategoryHandler(req, res) {
    try {
        const userId = req.user?._id || null; // null → create global category
        const { name } = req.body;

        const category = await createCategory(userId, name);

        return res.status(201).json({
            success: true,
            data: category,
            });
        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }
        console.error("Error creating category:", err);
        return res.status(500).json({ error: "Failed to create category" });
    }
}

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
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error("Error updating category:", err);
        return res.status(500).json({ error: "Failed to update category" });
    }
}

async function deleteCategoryHandler(req, res) {
    try {
        const userId = req.user?._id;
        const { id } = req.params;

        await deleteCategory(userId, id);

        return res.status(204).send();
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
    }
        console.error("Error deleting category:", err);
        return res.status(500).json({ error: "Failed to delete category" });
    }
}

module.exports = {
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
};