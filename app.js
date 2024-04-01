const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { CURSOR_FLAGS } = require('mongodb');
const app = express();
app.use(bodyParser.json());

// MongoDB Connection
DB_URL = 'mongodb+srv://dilishapriyashan076:qxL4z000ZoW2qMUT@cluster0.a76nu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB_URL)
.then(() => {
  console.log('DB connected');
})
.catch((err) => console.log('DB connection error', err));

mongoose.connect(DB_URL)
.then(() => {
  console.log('DB connected');
})
.catch((err) => {
  console.log('DB connection error', err);
  process.exit(1);
});

const User = mongoose.model('User', {
    email: String,
    password: String,
    fullName: String,
    phoneNumber: String,
    address: String,
    confirmPassword: String
});

const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    description: String,
    image : String,
    category : String,
    id: Number,
});

const CartItem = mongoose.model('CartItem', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
});
  
// Routes
app.post('/users/register', async (req, res) => {
  const { email, password, fullName, phoneNumber, address, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, fullName, phoneNumber, address });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Email already exists' });
  }
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    // For simplicity, we're not including token generation. It's highly recommended to implement JWT or similar for session management.
    res.status(200).json({ message: 'Login successful', user: { email: user.email, fullName: user.fullName } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes
app.post('/products/create', async (req, res) => {
  const data = req.body;
  try {
    const newProduct  = new Product(data);
    await newProduct.save();
    res.status(201).json({ message: 'User pr successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/products/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/products', async (req, res) => {
  //const { productId } = req.params;
  try {
    const product = await Product.find();
    console.log("product######",product)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    //res.json(product);
    res.status(200).json({
      status: 200,
      message: "success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    const cartItem = new CartItem({ userId, productId, quantity });
    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get all users
app.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      // Ensure the response is not empty. If users array is empty, it's still valid JSON.
      res.json(users);
    } catch (error) {
        console.error(error); // Log the error to the console for debugging
        // Send a consistent error message in JSON format
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Route to update user profile
app.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { fullName, phoneNumber } = req.body;
    try {
      // Find the user by ID and update their profile data
      const updatedUser = await User.findByIdAndUpdate(userId, { fullName, phoneNumber }, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.listen(8000, () => {
  console.log('Server running on port 8000');
});