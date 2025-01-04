require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: ['GET'],
    credentials: true
}));

// Route to get agenda items
app.get('/api/agenda', async(req, res) => {
    try {
        const response = await axios.get(
            `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Agenda?view=Grid%20view`, {
                headers: {
                    'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Airtable API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch agenda items' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});