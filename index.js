require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

const ItemSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now }
  });
  const Item = mongoose.model('Item', ItemSchema);

app.use(express.json());

app.get('/items', async (req, res) => {
    try {
      const items = await Item.find();
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener items' });
    }
  });
  
  // Iniciar servidor
  app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });