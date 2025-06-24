const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


dotenv.config();
connectDB();

const app = express();
app.use(express.json());


app.use('/api', require('./routes/userRoutes'));

app.get('/health', (req, res) => res.send('User service running ✅'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`User service on port ${PORT} 🚀`));
