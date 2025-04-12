import { nanoid } from 'nanoid';

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultDiv = document.getElementById('result');
    const shortUrlElement = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const historyDiv = document.getElementById('history');
    const historyItems = document.getElementById('history-items');
    
    // Load history from localStorage
    loadHistory();
    
    shortenBtn.addEventListener('click', async () => {
        const longUrl = urlInput.value.trim();
        
        if (!isValidUrl(longUrl)) {
            alert('Please enter a valid URL');
            return;
        }
        
        try {
            shortenBtn.disabled = true;
            shortenBtn.textContent = 'Shortening...';
            
            const shortUrl = await shortenUrl(longUrl);
            
            shortUrlElement.textContent = shortUrl;
            shortUrlElement.href = shortUrl;
            resultDiv.classList.remove('hidden');
            
            // Save to history
            saveToHistory(longUrl, shortUrl);
            
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Shorten';
        } catch (error) {
            console.error('Error shortening URL:', error);
            alert('Error shortening URL. Please try again.');
            shortenBtn.disabled = false;
            shortenBtn.textContent = 'Shorten';
        }
    });
    
    copyBtn.addEventListener('click', () => {
        const shortUrl = shortUrlElement.textContent;
        navigator.clipboard.writeText(shortUrl)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });
    
    // Function to shorten URL
    async function shortenUrl(longUrl) {
        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: longUrl }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to shorten URL');
            }
            
            const data = await response.json();
            return data.shortUrl;
        } catch (error) {
            console.error('Error in shortenUrl:', error);
            throw error;
        }
    }
    
    // Function to validate URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Function to save URL to history
    function saveToHistory(longUrl, shortUrl) {
        let history = JSON.parse(localStorage.getItem('urlHistory') || '[]');
        
        // Add to beginning of array
        history.unshift({
            longUrl,
            shortUrl,
            timestamp: Date.now()
        });
        
        // Keep only the latest 10 items
        history = history.slice(0, 10);
        
        localStorage.setItem('urlHistory', JSON.stringify(history));
        
        // Update the history display
        loadHistory();
    }
    
    // Function to load history from localStorage
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('urlHistory') || '[]');
        
        if (history.length === 0) {
            historyDiv.classList.add('hidden');
            return;
        }
        
        historyDiv.classList.remove('hidden');
        historyItems.innerHTML = '';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-item-urls">
                    <div class="original-url" title="${item.longUrl}">${item.longUrl}</div>
                    <a href="${item.shortUrl}" class="short-url" target="_blank">${item.shortUrl}</a>
                </div>
                <button class="copy-history-btn" data-url="${item.shortUrl}">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            
            historyItems.appendChild(historyItem);
        });
        
        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-history-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                navigator.clipboard.writeText(url)
                    .then(() => {
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                    });
            });
        });
    }
});

