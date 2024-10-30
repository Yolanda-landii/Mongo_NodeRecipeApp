const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const Recipe = require('./models/Recipe');
const auth = require('./middleware/auth'); 
const User = require('./models/User') 
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.use('/auth', authRoutes);

app.get('/users', async (req, res) => {
  try {
    const users = await User.find(); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, surname, email, username, password } = req.body;
    const user = new User({ name, surname, email, username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.get('/recipes', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const recipes = await Recipe.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Recipe.countDocuments();

    res.json({
      recipes,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/recipes', auth(['admin']), async (req, res) => {
  console.log(req.body);
  try {
      const recipe = new Recipe(req.body);
      await recipe.save();
      res.status(201).json(recipe);
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
});

app.put('/recipes/:id', auth('admin'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/recipes/:id', auth('admin'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error deleting recipe', error: err.message });
  }
});


app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
