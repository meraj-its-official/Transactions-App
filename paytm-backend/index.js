const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])
require('dotenv').config(); // Ye line .env file se data utha kar process.env mein daalti hai
const express = require('express')
const mainRouter = require('./routes/index.js')
const cors = require('cors')
const app = express();
app.use(express.json())
app.use(cors())

// 2. Data Push (Save) Karne Ka Route
app.use('/api/v1', mainRouter)


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});