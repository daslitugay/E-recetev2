const dotenv = require('dotenv');

const connectDB = require('../config/db');
const { User, USER_ROLES } = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env');
    }

    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: USER_ROLES.ADMIN,
      doctorStatus: 'NONE',
    });

    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Admin seed error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();