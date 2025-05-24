# Google Search API

A Node.js application that uses Puppeteer to perform Google searches and expose the results via an API.

## Features

- Google search automation using Puppeteer
- RESTful API endpoint for search queries
- Clean and modern web interface
- Displays search results with titles, links, and snippets
- Error handling and loading states

## Project Structure

```
├── public/
│   ├── css/
│   │   └── styles.css
│   └── index.html
├── src/
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open `http://localhost:3000` in your browser

## API Usage

Send a POST request to `/api/search` with the following JSON body:

```json
{
    "searchQuery": "your search query"
}
```

The API will return search results in the following format:

```json
{
    "searchQuery": "your search query",
    "results": [
        {
            "title": "Result Title",
            "link": "https://example.com",
            "snippet": "Result description..."
        }
    ]
}
```

## Dependencies

- Express.js - Web server framework
- Puppeteer - Headless browser automation
- Node.js - Runtime environment

## License

MIT
