// Content script - runs on web pages
// This can be used to interact with web pages if needed

console.log('Stock Portfolio Tracker content script loaded');

// Example: Could be used to scrape stock data from financial websites
// or enhance the user experience on stock-related pages

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
        // Example: Return page information
        sendResponse({
            url: window.location.href,
            title: document.title
        });
    }
});

// Optional: Add visual indicators on stock-related pages
function highlightStockSymbols() {
    // This could highlight monitored stock symbols on financial websites
    chrome.storage.local.get(['monitoredStocks'], (result) => {
        const stocks = result.monitoredStocks || [];
        const symbols = stocks.map(s => s.symbol);
        
        // Example implementation to highlight stock symbols
        symbols.forEach(symbol => {
            const regex = new RegExp(`\\b${symbol}\\b`, 'gi');
            // Implementation would depend on the specific website structure
        });
    });
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightStockSymbols);
} else {
    highlightStockSymbols();
}