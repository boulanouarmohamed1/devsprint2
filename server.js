
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 3001;
require('dotenv').config();
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use(cookieParser());
app.use(express.json());

app.use('/', userRoutes);
app.use('/', eventRoutes);

const connectDB = async () => {
    try {
        const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});