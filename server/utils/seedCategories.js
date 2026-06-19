const Category = require('../models/Category');

const defaultCategories = [
  { name: 'Electronics', icon: '💻', description: 'Phones, laptops, earphones, chargers, etc.' },
  { name: 'Wallets', icon: '👛', description: 'Wallets, purses, money bags' },
  { name: 'ID Cards', icon: '🪪', description: 'Student IDs, driving license, Aadhar, etc.' },
  { name: 'Keys', icon: '🔑', description: 'Room keys, vehicle keys, locker keys' },
  { name: 'Bags', icon: '🎒', description: 'Backpacks, handbags, laptop bags' },
  { name: 'Books', icon: '📚', description: 'Textbooks, notebooks, documents' },
  { name: 'Clothing', icon: '👕', description: 'Jackets, hoodies, uniforms' },
  { name: 'Pets', icon: '🐾', description: 'Lost or found animals' },
  { name: 'Documents', icon: '📄', description: 'Certificates, marksheets, passports' },
  { name: 'Other', icon: '📦', description: 'Anything that doesn\'t fit above categories' },
];

const seedCategories = async () => {
  try {
    const existing = await Category.countDocuments();
    if (existing === 0) {
      await Category.insertMany(defaultCategories);
      console.log('✅ Default categories seeded');
    } else {
      console.log(`ℹ️  Categories already exist (${existing} found). Skipping seed.`);
    }
  } catch (err) {
    console.error('❌ Error seeding categories:', err.message);
  }
};

module.exports = seedCategories;
