const express = require('express');
const app = express();

// Home route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
