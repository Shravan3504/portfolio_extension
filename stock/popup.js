// Popular stocks list (200 stocks)
const POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM',
    'ORCL', 'INTC', 'IBM', 'CSCO', 'AMD', 'QCOM', 'TXN', 'AVGO', 'MU', 'AMAT',
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'AXP', 'BLK', 'SCHW', 'USB',
    'JNJ', 'PFE', 'ABT', 'TMO', 'UNH', 'MDT', 'AMGN', 'GILD', 'BMY', 'LLY',
    'KO', 'PEP', 'MCD', 'SBUX', 'WMT', 'TGT', 'COST', 'HD', 'LOW', 'NKE',
    'DIS', 'CMCSA', 'VZ', 'T', 'CHTR', 'DISH', 'ROKU', 'SPOT', 'TWTR', 'SNAP',
    'XOM', 'CVX', 'COP', 'EOG', 'SLB', 'HAL', 'OXY', 'MPC', 'VLO', 'PSX',
    'BA', 'GE', 'CAT', 'MMM', 'HON', 'UTX', 'LMT', 'NOC', 'RTX', 'GD',
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
    'LT.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'MARUTI.NS', 'HCLTECH.NS', 'BAJFINANCE.NS', 'NESTLEIND.NS', 'ULTRACEMCO.NS', 'TITAN.NS', 'WIPRO.NS',
    'SUNPHARMA.NS', 'ONGC.NS', 'NTPC.NS', 'POWERGRID.NS', 'COALINDIA.NS', 'TECHM.NS', 'TATAMOTORS.NS', 'INDUSINDBK.NS', 'BAJAJFINSV.NS', 'DRREDDY.NS',
    'CIPLA.NS', 'DIVISLAB.NS', 'EICHERMOT.NS', 'HEROMOTOCO.NS', 'BRITANNIA.NS', 'GRASIM.NS', 'HINDALCO.NS', 'JSWSTEEL.NS', 'TATASTEEL.NS', 'ADANIPORTS.NS',
    'TSCO', 'UNILEVER', 'ASML', 'SAP', 'SHELL', 'ROCHE', 'NESTLE', 'NOVARTIS', 'SIEMENS', 'BMW',
    'TOYOTA', 'SONY', 'SAMSUNG', 'ALIBABA', 'TENCENT', 'BABA', 'JD', 'BIDU', 'NIO', 'XPEV',
    'V', 'MA', 'PYPL', 'SQ', 'ADYEN', 'SHOP', 'EBAY', 'MELI', 'SE', 'GRAB',
    'UBER', 'LYFT', 'ABNB', 'DASH', 'ZM', 'WORK', 'TEAM', 'NOW', 'SNOW', 'PLTR',
    'GME', 'AMC', 'BB', 'NOK', 'WISH', 'CLOV', 'SPCE', 'PLTR', 'HOOD', 'COIN',
    'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'VEA', 'VWO', 'GLD', 'SLV', 'TLT',
    'F', 'GM', 'RIVN', 'LCID', 'CCIV', 'GOEV', 'RIDE', 'WKHS', 'HYLN', 'NKLA',
    'DKNG', 'PENN', 'MGM', 'WYNN', 'LVS', 'CZR', 'BYD', 'RSI', 'GNOG', 'FUBO'
];

let stocksData = [];
let livePricesData = {};
let priceUpdateInterval;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup loaded');
    initializeExtension();
});

function initializeExtension() {
    loadStockOptions();
    loadMonitoredStocks();
    setupEventListeners();
    setupPriceUpdates(); // Add this line
}


function setupPriceUpdates() {
    // Update prices every 30 seconds
    priceUpdateInterval = setInterval(() => {
        if (stocksData.length > 0) {
            fetchLivePrices();
        }
    }, 30000);
}



function setupEventListeners() {
    const addStockBtn = document.getElementById('addStockBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    
    if (addStockBtn) {
        addStockBtn.addEventListener('click', addStock);
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateReturns);
    }
    
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', fetchLivePrices);
    }
}

function loadStockOptions() {
    const select = document.getElementById('stockSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a stock...</option>';
    
    POPULAR_STOCKS.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock;
        option.textContent = stock;
        select.appendChild(option);
    });
}

function addStock() {
    const stockSelect = document.getElementById('stockSelect');
    const investmentAmount = document.getElementById('investmentAmount');
    
    if (!stockSelect || !investmentAmount) {
        showStatus('Form elements not found', 'error');
        return;
    }
    
    const symbol = stockSelect.value.trim();
    const amount = parseFloat(investmentAmount.value);
    
    if (!symbol) {
        showStatus('Please select a stock', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showStatus('Please enter a valid investment amount', 'error');
        return;
    }
    

    chrome.storage.local.get(['monitoredStocks'], function(result) {
        if (chrome.runtime.lastError) {
            showStatus('Storage error: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        const stocks = result.monitoredStocks || [];
        

        const existingStock = stocks.find(s => s.symbol === symbol);
        if (existingStock) {
            showStatus(`${symbol} is already being monitored`, 'error');
            return;
        }
 
        const newStock = {
            symbol: symbol,
            investment: amount,
            dateAdded: new Date().toISOString()
        };
        
        stocks.push(newStock);
        

        chrome.storage.local.set({ monitoredStocks: stocks }, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving stock: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            showStatus(`${symbol} added successfully`, 'success');
            stockSelect.value = '';
            investmentAmount.value = '';
            loadMonitoredStocks();
        });
    });
}



function loadMonitoredStocks() {
    chrome.storage.local.get(['monitoredStocks'], function(result) {
        if (chrome.runtime.lastError) {
            showStatus('Storage error: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        stocksData = result.monitoredStocks || [];
        displayMonitoredStocks();
        
        // Fetch live prices after loading stocks
        if (stocksData.length > 0) {
            fetchLivePrices();
        }
    });
}




function displayMonitoredStocks() {
    const stocksList = document.getElementById('stocksList');
    if (!stocksList) return;
    

    stocksList.innerHTML = '';
    
    if (stocksData.length === 0) {
        stocksList.innerHTML = '<p style="text-align: center; color: #666;">No stocks being monitored</p>';
        return;
    }
    

    stocksData.forEach((stock, index) => {
        const stockItem = createStockItem(stock, index);
        stocksList.appendChild(stockItem);
    });
}




function createStockItem(stock, index) {
    const stockItem = document.createElement('div');
    stockItem.className = 'stock-item';
    stockItem.setAttribute('data-symbol', stock.symbol);
    stockItem.setAttribute('data-index', index);
    
    // Get live data for this stock
    const liveData = livePricesData[stock.symbol];
    
    // Main stock info
    const stockMainInfo = document.createElement('div');
    stockMainInfo.className = 'stock-main-info';
    
    const symbolElement = document.createElement('div');
    symbolElement.className = 'stock-symbol';
    symbolElement.textContent = stock.symbol;
    
    const investmentElement = document.createElement('div');
    investmentElement.className = 'stock-investment';
    investmentElement.textContent = `Investment: ₹${stock.investment.toFixed(2)}`;
    
    stockMainInfo.appendChild(symbolElement);
    stockMainInfo.appendChild(investmentElement);
    
    // Price section
    const priceSectionDiv = document.createElement('div');
    priceSectionDiv.className = 'stock-price-section';
    
    // Mini chart
    if (liveData && liveData.chartData) {
        const chart = createMiniChart(liveData.chartData, stock.symbol);
        priceSectionDiv.appendChild(chart);
    }
    
    // Price info
    const priceInfoDiv = document.createElement('div');
    priceInfoDiv.className = 'stock-price-info';
    
    if (liveData && liveData.currentPrice) {
        const currentPriceDiv = document.createElement('div');
        currentPriceDiv.className = 'current-price';
        currentPriceDiv.textContent = `${liveData.currentPrice.toFixed(2)}`;
        
        const changeDiv = document.createElement('div');
        changeDiv.className = 'price-change';
        
        if (liveData.changePercent > 0) {
            changeDiv.classList.add('positive');
            changeDiv.textContent = `+${liveData.changePercent.toFixed(2)}%`;
        } else if (liveData.changePercent < 0) {
            changeDiv.classList.add('negative');
            changeDiv.textContent = `${liveData.changePercent.toFixed(2)}%`;
        } else {
            changeDiv.classList.add('neutral');
            changeDiv.textContent = '0.00%';
        }
        
        priceInfoDiv.appendChild(currentPriceDiv);
        priceInfoDiv.appendChild(changeDiv);
    } else {
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'Loading...';
        loadingDiv.style.fontSize = '11px';
        loadingDiv.style.color = '#666';
        priceInfoDiv.appendChild(loadingDiv);
    }
    
    priceSectionDiv.appendChild(priceInfoDiv);

    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.type = 'button';
    
    deleteBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleDeleteStock(stock.symbol, index);
    });
    
    // Assemble the stock item
    stockItem.appendChild(stockMainInfo);
    stockItem.appendChild(priceSectionDiv);
    stockItem.appendChild(deleteBtn);
    
    return stockItem;
}





function handleDeleteStock(symbol, index) {
    console.log(`Attempting to delete stock: ${symbol} at index: ${index}`);
    

    if (!confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
        return;
    }
    

    stocksData = stocksData.filter(stock => stock.symbol !== symbol);
    

    chrome.storage.local.set({ monitoredStocks: stocksData }, function() {
        if (chrome.runtime.lastError) {
            showStatus('Error removing stock: ' + chrome.runtime.lastError.message, 'error');
            loadMonitoredStocks();
            return;
        }
        
        console.log(`Successfully deleted ${symbol}`);
        showStatus(`${symbol} removed successfully`, 'success');
        
        displayMonitoredStocks();

        const resultsDiv = document.getElementById('results');
        if (resultsDiv && resultsDiv.innerHTML.includes(symbol)) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: #666;">Portfolio updated. Click "Calculate Returns" to refresh results.</p>';
        }
    });
}

function calculateReturns() {
    if (stocksData.length === 0) {
        showStatus('No stocks to calculate returns for', 'error');
        return;
    }

    showStatus('Calculating returns...', 'info');
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';
    }

    fetch('http://localhost:5000/calculate-returns', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stocks: stocksData })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Print full data for debugging
            console.log("Full data received:", data);

            // Render main table
            displayResults(data.results);

            // Render individual stocks below the table
            displayIndividualResults(data.results);

            // Render portfolio summary
            displayPortfolioSummary(data.summary);

            showStatus('Returns calculated successfully', 'success');
        } else {
            showStatus('Error calculating returns: ' + (data.error || 'Unknown error'), 'error');
        }
    })
    .catch(error => {
        console.error('API Error:', error);
        showStatus('Error connecting to backend: ' + error.message, 'error');
    })
    .finally(() => {
        if (calculateBtn) {
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate Returns';
        }
    });
}
function displayIndividualResults(results) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    // Clear previous content before appending
    const individualDiv = document.createElement('div');
    individualDiv.style.marginTop = '20px';
    individualDiv.innerHTML = `<h4>Individual Results (Actual Amounts):</h4>`;

    results.forEach(stock => {
        const investment = parseFloat(stock['Investment Amount'].replace(/[₹,]/g, ''));

        const oneYearPercent = parseFloat((stock['1 Year Return'] || '0').replace('%', '')) || 0;
        const oneYearProfit = (investment * oneYearPercent) / 100;
        const oneYearTotal = investment + oneYearProfit;

        const threeYearPercent = parseFloat((stock['3 Years Return'] || '0').replace('%', '')) || 0;
        const threeYearProfit = (investment * threeYearPercent) / 100;
        const threeYearTotal = investment + threeYearProfit;

        const fiveYearPercent = parseFloat((stock['5 Years Return'] || '0').replace('%', '')) || 0;
        const fiveYearProfit = (investment * fiveYearPercent) / 100;
        const fiveYearTotal = investment + fiveYearProfit;

        const getColoredSpan = (value, prefix = '₹') => {
            const color = value >= 0 ? '#4CAF50' : '#f44336';
            const sign = value >= 0 ? '+' : '';
            return `<span style="color: ${color};">${sign}${prefix}${value.toFixed(2)}</span>`;
        };

        const stockHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background-color: #fafafa; border: 1px solid #ddd; border-radius: 6px;">
                <strong>${stock.Stock}</strong><br>
                Investment: ₹${investment.toLocaleString()}<br><br>

                1 Year: ${oneYearPercent.toFixed(2)}% → Profit: ${getColoredSpan(oneYearProfit)} → Total: ₹${oneYearTotal.toFixed(2)}<br>
                3 Years: ${threeYearPercent.toFixed(2)}% → Profit: ${getColoredSpan(threeYearProfit)} → Total: ₹${threeYearTotal.toFixed(2)}<br>
                5 Years: ${fiveYearPercent.toFixed(2)}% → Profit: ${getColoredSpan(fiveYearProfit)} → Total: ₹${fiveYearTotal.toFixed(2)}
            </div>
        `;

        individualDiv.innerHTML += stockHTML;
    });

    resultsDiv.appendChild(individualDiv);
}





function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align: center; color: #666;">No results to display</p>';
        return;
    }

    // Table (as you already have)
    let tableHTML = `<table class="results-table">
        <thead>
            <tr>
                <th>Stock</th>
                <th>Investment</th>
                <th>1 Year</th>
                <th>3 Years</th>
                <th>5 Years</th>
            </tr>
        </thead><tbody>`;

    results.forEach(stock => {
        tableHTML += `
            <tr>
                <td><strong>${stock.Stock}</strong></td>
                <td>${stock['Investment Amount']}</td>
                <td class="${getReturnClass(stock['1 Year Return'])}">${stock['1 Year Return']}</td>
                <td class="${getReturnClass(stock['3 Years Return'])}">${stock['3 Years Return']}</td>
                <td class="${getReturnClass(stock['5 Years Return'])}">${stock['5 Years Return']}</td>
            </tr>`;
    });

    tableHTML += '</tbody></table>';

    resultsDiv.innerHTML = tableHTML;
}

function getReturnClass(returnStr) {
    if (!returnStr || returnStr === 'Data not available' || returnStr === 'Error fetching data') {
        return '';
    }
    const value = parseFloat(returnStr.replace('%', ''));
    return value >= 0 ? 'positive' : 'negative';
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `status-${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
    }, 3000);
}

// Debug function - can be called from console
function debugStorage() {
    chrome.storage.local.get(['monitoredStocks'], function(result) {
        console.log('Current stored stocks:', result.monitoredStocks);
    });
}



function fetchLivePrices() {
    if (stocksData.length === 0) return;

    const symbols = stocksData.map(stock => stock.symbol);
    const refreshBtn = document.getElementById('refreshPricesBtn');

    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Updating...';
    }

    fetch('http://localhost:5000/live-prices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols: symbols })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            livePricesData = {};
            let indiaOpen = false;
            let usOpen = false;

            data.data.forEach(stock => {
                livePricesData[stock.symbol] = stock;

                if (stock.market === "INDIA" && stock.marketStatus === "OPEN") indiaOpen = true;
                if (stock.market === "US" && stock.marketStatus === "OPEN") usOpen = true;
            });

            displayMonitoredStocks();
            updateLastUpdatedTime();

            // 🔁 If both markets are closed, stop further auto-refresh
            if (!indiaOpen && !usOpen && priceUpdateInterval) {
                clearInterval(priceUpdateInterval);
                console.log("⏸️ Stopping price updates - both markets are closed");
            }
        } else {
            console.error('Error fetching live prices:', data.error);
        }
    })
    .catch(error => {
        console.error('API Error:', error);
    })
    .finally(() => {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Prices';
        }
    });
}

function updateLastUpdatedTime() {
    const lastUpdatedDiv = document.getElementById('lastUpdated');
    if (lastUpdatedDiv) {
        const now = new Date();
        lastUpdatedDiv.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

function createMiniChart(chartData, symbol) {
    if (!chartData || chartData.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'chart-loading';
        placeholder.textContent = 'No data';
        return placeholder;
    }
    
    const canvas = document.createElement('canvas');
    canvas.className = 'mini-chart';
    canvas.width = 60;
    canvas.height = 30;
    
    const ctx = canvas.getContext('2d');
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    if (priceRange === 0) {
        // If all prices are the same, draw a flat line
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(60, 15);
        ctx.stroke();
        return canvas;
    }
    
    // Determine line color based on trend
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    
    ctx.strokeStyle = isPositive ? '#4CAF50' : '#f44336';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    prices.forEach((price, index) => {
        const x = (index / (prices.length - 1)) * 60;
        const y = 30 - ((price - minPrice) / priceRange) * 30;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    return canvas;
}

function displayPortfolioSummary(summary) {
    const summaryDiv = document.getElementById('displayPortfolioSummary');
    if (!summaryDiv) return;

    if (!summary) {
        summaryDiv.innerHTML = '<p style="color: red;">No summary data received</p>';
        return;
    }

    summaryDiv.innerHTML = `<p style="font-size: 18px; font-weight: bold; color: #333;">💰 Total Invested: ₹${summary.total_invested.toLocaleString()}</p>`;

    let tableHTML = `<h3>Portfolio Summary</h3>`;
    tableHTML += `<table class="results-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Returns</th>
                            <th>Total Value</th>
                        </tr>
                    </thead>
                    <tbody>`;

    // 1 Year
    tableHTML += `
        <tr>
            <td>After 1 Year</td>
            <td>${getColoredAmount(summary.after_1y.returns)}</td>
            <td>₹${summary.after_1y.total_value.toLocaleString()}</td>
        </tr>`;

    // 3 Years
    tableHTML += `
        <tr>
            <td>After 3 Years</td>
            <td>${getColoredAmount(summary.after_3y.returns)}</td>
            <td>₹${summary.after_3y.total_value.toLocaleString()}</td>
        </tr>`;

    // 5 Years
    tableHTML += `
        <tr>
            <td>After 5 Years</td>
            <td>${getColoredAmount(summary.after_5y.returns)}</td>
            <td>₹${summary.after_5y.total_value.toLocaleString()}</td>
        </tr>`;

    tableHTML += `</tbody></table>`;

    summaryDiv.innerHTML += tableHTML;
}


// Helper function to color positive/negative returns
function getColoredAmount(value) {
    const color = value >= 0 ? '#4CAF50' : '#f44336';
    const sign = value >= 0 ? '+' : '';
    return `<span style="color: ${color};">${sign}₹${value.toLocaleString()}</span>`;
}

function showFullChart(symbol) {
    const stockData = livePricesData[symbol];
    if (!stockData || !stockData.chartData || stockData.chartData.length === 0) {
        alert("No chart data available.");
        return;
    }

    // Create modal for full chart (basic)
    const modal = document.createElement('div');
    modal.className = 'chart-modal';
    modal.innerHTML = `
        <div class="chart-modal-content">
            <span class="chart-close">&times;</span>
            <canvas id="fullChartCanvas"></canvas>
        </div>
    `;
    document.body.appendChild(modal);

    // Close functionality
    modal.querySelector('.chart-close').onclick = () => {
        document.body.removeChild(modal);
    };

    // Prepare data
    const labels = stockData.chartData.map(p => p.time);
    const prices = stockData.chartData.map(p => p.price);
    const isDaily = labels[0].length === 10;  // yyyy-MM-dd detection

    const ctx = document.getElementById('fullChartCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${symbol} Price`,
                data: prices,
                borderColor: 'blue',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: isDaily ? 'day' : 'minute',
                        tooltipFormat: isDaily ? 'yyyy-MM-dd' : 'HH:mm',
                        displayFormats: {
                            day: 'yyyy-MM-dd',
                            minute: 'HH:mm'
                        }
                    }
                }
            }
        }
    });
}


// Make functions available globally for debugging
window.debugStorage = debugStorage;
window.stocksData = stocksData;

