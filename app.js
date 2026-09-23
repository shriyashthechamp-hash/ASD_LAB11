const express = require('express');
const pool = require('./db');

const app = express();

app.use(express.json());

app.post('/assignments', async (req, res) => {
    try {
        const { title, deadline } = req.body;
        const result = await pool.query(
            'INSERT INTO assignments (title, deadline) VALUES ($1, $2) RETURNING *;',
            [title, deadline]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/assignments', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM assignments ORDER BY id DESC;'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
