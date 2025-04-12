import { nanoid } from 'nanoid';

// In-memory storage for demonstration
// In a real app, you'd use a database like MongoDB, Postgres, etc.
let urlDatabase = {};

export default async function handler(req, res) {
    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { url } = req.body;
        
        // Validate URL
        if (!url || !isValidUrl(url)) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }
        
        // Generate a short code (1-6 characters)
        const shortCode = nanoid(Math.floor(Math.random() * 6) + 1);
        
        // Store the mapping
        urlDatabase[shortCode] = url;
        
        // Construct the short URL
        const host = req.headers.host || 'siximchat.vercel.app';
        const shortUrl = `https://${host}/url/${shortCode}`;
        
        return res.status(200).json({
            originalUrl: url,
            shortUrl,
            shortCode
        });
    } catch (error) {
        console.error('Error shortening URL:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

