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
        if (req.query.submitted !== undefined) {
            const isSubmitted = req.query.submitted === 'true';
            const result = await pool.query(
                'SELECT * FROM assignments WHERE submitted = $1 ORDER BY id DESC;',
                [isSubmitted]
            );
            return res.status(200).json(result.rows);
        }

        const result = await pool.query(
            'SELECT * FROM assignments ORDER BY id DESC;'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE assignments SET submitted = true WHERE id = $1 RETURNING *;',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM assignments WHERE id = $1 RETURNING *;',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json({
            message: 'Assignment deleted successfully',
            assignment: result.rows[0]
        });
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
