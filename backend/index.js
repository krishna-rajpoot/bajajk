const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// The payload might be large due to base64 strings
app.use(express.json({ limit: '50mb' }));

// Helper function to check if a number is prime
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

// Helper to determine mime type from base64 string
// Supports strings with or without data URL prefix (data:image/png;base64,...)
async function getFileDetails(base64String) {
    if (!base64String) {
        return { file_valid: false, file_mime_type: null, file_size_kb: null };
    }

    try {
        let b64Data = base64String;
        let mimeType = 'application/octet-stream';

        // Check if it's a data URL
        const dataUrlRegex = /^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/;
        const match = base64String.match(dataUrlRegex);

        if (match) {
            mimeType = match[1];
            b64Data = match[2];
        }

        const buffer = Buffer.from(b64Data, 'base64');
        const sizeKb = (buffer.length / 1024).toFixed(2);

        // If it wasn't a data URL, let's try to detect using file-type
        if (!match) {
            try {
                const { fileTypeFromBuffer } = await import('file-type');
                const type = await fileTypeFromBuffer(buffer);
                if (type) {
                    mimeType = type.mime;
                }
            } catch (err) {
                console.error("Error detecting file type:", err);
            }
        }

        return {
            file_valid: true,
            file_mime_type: mimeType,
            file_size_kb: String(Math.round(sizeKb)) // Convert to string as per example output ("400")
        };
    } catch (error) {
        return { file_valid: false, file_mime_type: null, file_size_kb: null };
    }
}

app.get('/bfhl', (req, res) => {
    res.status(200).json({ operation_code: 1 });
});

app.post('/bfhl', async (req, res) => {
    try {
        const { data, file_b64 } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ is_success: false, message: "Invalid input" });
        }

        const numbers = [];
        const alphabets = [];
        let highestLowercase = null;
        let primeFound = false;

        data.forEach(item => {
            if (typeof item !== 'string') return;

            // Check if it's a number
            if (!isNaN(item) && item.trim() !== '') {
                numbers.push(item);
                if (isPrime(parseInt(item, 10))) {
                    primeFound = true;
                }
            } 
            // Check if it's a single alphabet character
            else if (/^[a-zA-Z]$/.test(item)) {
                alphabets.push(item);
                
                // Track highest lowercase
                if (/^[a-z]$/.test(item)) {
                    if (!highestLowercase || item > highestLowercase) {
                        highestLowercase = item;
                    }
                }
            }
        });

        const fileDetails = await getFileDetails(file_b64);

        const response = {
            is_success: true,
            user_id: "krishna_rajpoot_01012000",
            email: "krishna@xyz.com",
            roll_number: "0827al231060",
            numbers: numbers,
            alphabets: alphabets,
            highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
            is_prime_found: primeFound,
            file_valid: fileDetails.file_valid,
            file_mime_type: fileDetails.file_mime_type || "doc/pdf", // fallback if null but valid
            file_size_kb: fileDetails.file_size_kb || "0"
        };
        
        if(!response.file_valid) {
            delete response.file_mime_type;
            delete response.file_size_kb;
            
            // Actually, based on example C, if it's invalid it might not have those fields.
            // But let's check Example C from instructions.
            // Example C output: "file_valid": false. No other file fields.
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ is_success: false, message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
