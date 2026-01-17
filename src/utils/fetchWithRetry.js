const fetch = require('node-fetch');

/**
 * Executes a fetch request with exponential backoff for resilience.
 * @param {string} url - API endpoint URL.
 * @param {object} options - Fetch options (method, headers, body).
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<Response>} - The fetch response.
 */
async function fetchWithRetry(url, options, retries = 3) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (response.ok) {
                return response;
            }

            if (response.status === 429) { // Rate limit error
                const delay = Math.pow(2, i) * 1000; // Exponential delay (1s, 2s, 4s)
                console.warn(`Rate limit hit (429). Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // For non-429 errors, still return the response so caller can handle it
            // This allows reading error messages from the API
            return response;
        } catch (error) {
            lastError = error;
            console.error(`Fetch attempt ${i + 1} failed:`, error.message);
            
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                console.warn(`Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // If we get here, all retries failed
    console.error("Fetch failed after all retries:", lastError);
    throw lastError || new Error("Fetch failed after all retries");
}

module.exports = fetchWithRetry;
