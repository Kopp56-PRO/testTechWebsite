const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'VM' directory
app.use(express.static(path.join(__dirname, 'VM')));

// Handle POST request to save request data
app.post('/submit-request', (req, res) => {
    const requestData = req.body;

    // Define the path to the requests.json file
    const filePath = path.join(__dirname, 'requests.json');

    // Read existing data from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        let existingData = [];
        if (data) {
            existingData = JSON.parse(data);
        }

        // Add the new request data to existing data
        existingData.push(requestData);

        // Write the updated data back to the file
        fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing to file' });
            }

            res.json({ message: 'Request saved successfully!' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
