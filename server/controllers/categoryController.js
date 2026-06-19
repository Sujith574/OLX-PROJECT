const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.status(200).json({ success: true, categories });
  } catch (error) { next(error); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    const category = await Category.create({ name, icon, description });
    res.status(201).json({ success: true, message: 'Category created!', category });
  } catch (error) { next(error); }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, message: 'Category updated!', category });
  } catch (error) { next(error); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.status(200).json({ success: true, message: 'Category deleted!' });
  } catch (error) { next(error); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
