import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Website')));

// Open SQLite database
let db;
(async () => {
    db = await open({
        filename: path.join(__dirname, 'AccountData', 'accounts.db'),
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );
    `);
})();

// Endpoint to handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.get('SELECT * FROM accounts WHERE email = ? AND password = ?', [email, password]);
        if (user) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint to handle account creation
app.post('/create-account', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await db.get('SELECT * FROM accounts WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        await db.run('INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint to handle password change
app.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        const user = await db.get('SELECT * FROM accounts WHERE email = ? AND password = ?', [email, currentPassword]);
        if (user) {
            await db.run('UPDATE accounts SET password = ? WHERE email = ?', [newPassword, email]);
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid current password' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint to handle account deletion
app.post('/delete-account', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.run('DELETE FROM accounts WHERE email = ?', [email]);
        if (result.changes > 0) {
            res.json({ success: true, message: 'Account deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Account not found' });
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint to get username by email
app.post('/get-username', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const account = await db.get('SELECT username FROM accounts WHERE email = ?', [email]);

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.status(200).json({ username: account.username });
    } catch (error) {
        console.error('Error retrieving username:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
