const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    await User.create({
      name: 'Admin',
      username: 'admin',
      email: 'admin@krishiai.com',
      password: hashedPassword,
      phone: '',
      role: 'admin',
    });

    console.log('Admin user seeded successfully (username: admin, password: admin)');
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
