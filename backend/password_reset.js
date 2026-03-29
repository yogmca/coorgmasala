const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@coorgmasala.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('Found admin user:', admin.email);

    // Hash new password
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password directly (bypass the pre-save hook)
    await User.updateOne(
      { email: 'admin@coorgmasala.com' },
      { $set: { password: hashedPassword } }
    );

    console.log('\n✅ Admin password reset successfully');
    console.log('Email: admin@coorgmasala.com');
    console.log('Password: Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetAdminPassword();
