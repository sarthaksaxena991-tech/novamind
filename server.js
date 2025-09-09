const express = require('express');
const cors = require('cors');
const resetRoutes = require('./js/resetRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// use OTP reset routes
app.use(resetRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
