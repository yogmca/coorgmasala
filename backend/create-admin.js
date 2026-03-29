const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin credentials
const ADMIN_CREDENTIALS = {
  name: 'Admin User',
  email: 'admin@coorgmasala.com',
  password: 'Admin@123',
  phone: '+91-9876543210',
  role: 'admin'
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coorg-spices';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema (inline for this script)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{ 
    street: String, 
    city: String, 
    state: String, 
    pincode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', ADMIN_CREDENTIALS.email);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      console.log('\n📋 Admin Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:', ADMIN_CREDENTIALS.email);
      console.log('Password:', ADMIN_CREDENTIALS.password);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    // Create new admin user
    const adminUser = new User({
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      password: hashedPassword,
      phone: ADMIN_CREDENTIALS.phone,
      role: 'admin',
      addresses: []
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', ADMIN_CREDENTIALS.email);
    console.log('Password:', ADMIN_CREDENTIALS.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Main function
const main = async () => {
  console.log('\n🔧 Setting up Admin User...\n');
  
  await connectDB();
  await createAdminUser();
  
  console.log('✅ Setup complete!\n');
  console.log('📍 Access admin panel at: http://localhost:3000/admin');
  console.log('   (after logging in with the credentials above)\n');
  
  process.exit(0);
};

// Run the script
main();
