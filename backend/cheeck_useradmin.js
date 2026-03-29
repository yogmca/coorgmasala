const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Check for admin user
    const admin = await User.findOne({ email: 'admin@coorgmasala.com' });
    
    if (admin) {
      console.log('\n✅ Admin user found:');
      console.log('ID:', admin._id);
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Phone:', admin.phone);
      console.log('Created:', admin.createdAt);
      console.log('Password hash:', admin.password.substring(0, 20) + '...');
    } else {
      console.log('\n❌ Admin user NOT found in database');
      console.log('\nSearching for all users...');
      const allUsers = await User.find({});
      console.log(`Found ${allUsers.length} user(s) in database:`);
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.role})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
};

checkUser();
