const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

app.use(express.urlencoded({ extended: true }));


require('dotenv').config();
const requestRoutes = require('./routes/requestRoutes');

app.use(express.json());
// Attach route
app.use('/requests', requestRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});


// Connect to MongoDB
mongoose.connect('mongodb+srv://achrafbougroura05:yI91MOJZtVNIYsTI@cluster0.ggqgkll.mongodb.net/all-data?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.log(err);
  });

// Start server
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});


