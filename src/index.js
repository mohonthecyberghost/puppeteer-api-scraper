const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get random delay between min and max
const randomDelay = (min, max) => delay(Math.floor(Math.random() * (max - min + 1) + min));

// API endpoint for Google search
app.post('/api/search', async (req, res) => {
    const { searchQuery } = req.body;
    
    if (!searchQuery) {
        console.log('Error: Search query is required');
        return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`Starting search for query: "${searchQuery}"`);
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        console.log('Browser launched successfully');

        console.log('Creating new page...');
        const page = await browser.newPage();
        console.log('New page created');
        
        console.log('Setting user agent...');
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('User agent set');
        
        console.log('Setting viewport...');
        await page.setViewport({ width: 1920, height: 1080 });
        console.log('Viewport set');

        console.log('Setting extra headers...');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });
        console.log('Extra headers set');

        console.log('Navigating to Google...');
        await page.goto('https://www.google.com', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        console.log('Successfully navigated to Google');

        console.log('Performing random mouse movement...');
        await page.mouse.move(Math.random() * 1000, Math.random() * 1000);
        await randomDelay(500, 1000);
        console.log('Random mouse movement completed');

        console.log('Waiting for search input...');
        await page.waitForSelector('textarea[name="q"], input[name="q"]', { timeout: 5000 });
        console.log('Search input found');

        console.log('Clicking search box...');
        await page.click('textarea[name="q"], input[name="q"]');
        await randomDelay(300, 700);
        console.log('Search box clicked');

        console.log('Typing search query...');
        for (const char of searchQuery) {
            await page.type('textarea[name="q"], input[name="q"]', char, { delay: Math.random() * 100 + 50 });
            await randomDelay(50, 150);
        }
        console.log('Search query typed');
        
        console.log('Waiting before pressing enter...');
        await randomDelay(800, 1500);
        
        console.log('Pressing enter...');
        await page.keyboard.press('Enter');
        console.log('Enter pressed');

        console.log('Waiting for search results...');
        await page.waitForSelector('#search, #rso, div[data-sokoban-container], .g', { timeout: 10000 });
        console.log('Search results found');

        // Add a small delay to ensure results are fully loaded
        await delay(2000);

        console.log('Extracting search results...');
        const results = await page.evaluate(() => {
            const searchResults = [];
            // Try different selectors for search results
            const selectors = [
                'div.g',
                'div[data-hveid]',
                'div.rc',
                'div.yuRUbf',
                'div[data-sokoban-container] div.g',
                '#search div.g',
                '#rso div.g'
            ];
            
            let elements = [];
            for (const selector of selectors) {
                elements = document.querySelectorAll(selector);
                if (elements.length > 0) break;
            }
            
            elements.forEach((element) => {
                // Try different selectors for title
                const titleSelectors = ['h3', '.LC20lb', '.DKV0Md'];
                let titleElement = null;
                for (const selector of titleSelectors) {
                    titleElement = element.querySelector(selector);
                    if (titleElement) break;
                }

                // Try different selectors for link
                const linkSelectors = ['a[href^="http"]', 'a[ping]', 'a[data-ved]'];
                let linkElement = null;
                for (const selector of linkSelectors) {
                    linkElement = element.querySelector(selector);
                    if (linkElement) break;
                }

                // Try different selectors for snippet
                const snippetSelectors = ['.VwiC3b', '.st', '.IsZvec', '.aCOpRe'];
                let snippetElement = null;
                for (const selector of snippetSelectors) {
                    snippetElement = element.querySelector(selector);
                    if (snippetElement) break;
                }
                
                if (titleElement) {
                    searchResults.push({
                        title: titleElement.textContent.trim(),
                        link: linkElement ? linkElement.href : null,
                        snippet: snippetElement ? snippetElement.textContent.trim() : null
                    });
                }
            });
            
            return searchResults;
        });

        console.log(`Extracted ${results.length} results:`, results);

        // Take a screenshot for debugging
        await page.screenshot({ path: 'search-results.png' });
        console.log('Screenshot saved as search-results.png');

        console.log('Sending response...');
        const responseData = {
            searchQuery,
            results: results.slice(0, 10) // Only return first 10 results
        };
        console.log('Response data:', responseData);
        res.json(responseData);
        console.log('Response sent successfully');

    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ 
            error: 'An error occurred during the search',
            details: error.message
        });
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
            console.log('Browser closed');
        }
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to test the API`);
}); 