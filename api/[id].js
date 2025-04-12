// In-memory storage (same as in shorten.js)
// In a real app, you'd use a database like MongoDB, Postgres, etc.
let urlDatabase = {};

export default function handler(req, res) {
    const { id } = req.query;
    
    // Check if the short code exists in our database
    if (urlDatabase[id]) {
        // Redirect to the original URL
        return res.redirect(301, urlDatabase[id]);
    } else {
        // Return a 404 if the short code doesn't exist
        return res.status(404).json({ error: 'URL not found' });
    }
}

