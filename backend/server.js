const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');

// Load environment variables from .env file located in the Website directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());

// Configure session
app.use(session({
    secret: process.env.SECRET_KEY || 'CarmaSontalija12333', // Replace with your secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Check if the database connection is successful
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to the database');
    release();
});

// Endpoint to check email and username availability
app.post('/check-availability', async (req, res) => {
    const { email, username } = req.body;

    try {
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];
            return res.status(200).json({ 
                emailExists: user.email === email,
                usernameExists: user.username === username 
            });
        } else {
            return res.status(200).json({ emailExists: false, usernameExists: false });
        }
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Function to get a random profile picture
function getRandomProfilePicture() {
    const directoryPath = path.join(__dirname, '../accessories/random-pfp');
    const files = fs.readdirSync(directoryPath);
    const randomIndex = Math.floor(Math.random() * files.length);
    const filePath = path.join(directoryPath, files[randomIndex]);
    return fs.readFileSync(filePath);
}

// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Lozinke se ne podudaraju." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if email or username already exists
        const existingUser = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR username = $2`,
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email ili korisničko ime već postoji." });
        }

        const profilePicture = getRandomProfilePicture();
        const result = await pool.query(
            `INSERT INTO users (email, username, display_name, password, profile_picture) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, username`,
            [email, username, username, hashedPassword, profilePicture]
        );

        console.log('User registered:', {
            id: result.rows[0].id,
            email: result.rows[0].email,
            username: result.rows[0].username
        });

        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ success: false, message: "Greška na serveru." });
    }
});

// Endpoint to handle user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query(
            `SELECT * FROM users WHERE email = $1 OR username = $2`,
            [username, username]
        );

        if (user.rows.length === 0) {
            console.log('User not found');
            return res.status(400).json({ success: false, message: "Korisničko ime ili lozinka nije tačna." });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            console.log('Invalid password');
            return res.status(400).json({ success: false, message: "Korisničko ime ili lozinka nije tačna." });
        }

        // Store user ID in session
        req.session.userId = user.rows[0].id;

        res.status(200).json({ 
            success: true, 
            displayName: user.rows[0].display_name, 
            profilePicture: user.rows[0].profile_picture.toString('base64') // Convert binary data to base64 string
        });
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Endpoint to get user details
app.get('/get-user-details', async (req, res) => {
    try {
        const userId = req.session.userId; // Assuming you store user ID in session
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }
        const result = await pool.query('SELECT display_name, profile_picture FROM users WHERE id = $1', [userId]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.status(200).json({
                success: true,
                user: {
                    display_name: user.display_name,
                    profile_picture: user.profile_picture.toString('base64') // Convert binary data to base64 string
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user details:', error.stack);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
