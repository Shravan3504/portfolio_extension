// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Stock Portfolio Tracker extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStocks') {
        chrome.storage.local.get(['monitoredStocks'], (result) => {
            sendResponse({stocks: result.monitoredStocks || []});
        });
        return true; // Keep the message channel open for async response
    }
});

// Optional: Handle periodic updates or background tasks
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateStockData') {
        // Could implement periodic stock data updates here
        console.log('Periodic stock update triggered');
    }
});

// Create a periodic alarm for stock updates (optional)
chrome.alarms.create('updateStockData', {
    delayInMinutes: 60, // Update every hour
    periodInMinutes: 60
});