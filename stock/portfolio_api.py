from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import pytz

app = Flask(__name__)
CORS(app)

def get_intraday_chart_data(symbol):
    try:
        ticker = yf.Ticker(symbol)

        # Choose timezone based on symbol
        if symbol.endswith('.NS') or symbol.endswith('.BO'):
            market_tz = pytz.timezone('Asia/Kolkata')
        else:
            market_tz = pytz.timezone('America/New_York')

        now = datetime.now(market_tz)
        weekday = now.weekday()  # Monday = 0, Sunday = 6
        today_date = now.date()

        # Fetch 5-minute interval data for 2 days
        hist = ticker.history(period="2d", interval="5m")
        if hist.empty:
            raise ValueError(f"No intraday data returned for {symbol}")

        # Ensure timezone-aware and converted
        if hist.index.tz is None:
            hist.index = hist.index.tz_localize("UTC").tz_convert(market_tz)
        else:
            hist.index = hist.index.tz_convert(market_tz)

        # Determine the latest valid trading day
        valid_dates = sorted(set(hist.index.date), reverse=True)
        filtered_data = pd.DataFrame()

        for date in valid_dates:
            day_data = hist[hist.index.date == date]
            if not day_data.empty:
                filtered_data = day_data
                break

        if filtered_data.empty:
            raise ValueError(f"No valid intraday data found for {symbol}")

        # Format data for frontend
        chart_data = [
            {"time": ts.strftime('%Y-%m-%d %H:%M'), "price": float(row['Close'])}
            for ts, row in filtered_data.iterrows()
        ]

        print(f"[{symbol}] Returning {len(chart_data)} intraday points from {filtered_data.index[0].date()}")
        return chart_data

    except Exception as e:
        print(f"Chart error for {symbol}: {e}")
        return []

@app.route('/live-prices', methods=['POST'])
def get_live_prices():
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])

        if not symbols:
            return jsonify({'success': False, 'error': 'No symbols provided'})

        results = []

        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info

                if symbol.endswith('.NS') or symbol.endswith('.BO'):
                    market = 'INDIA'
                    market_tz = pytz.timezone('Asia/Kolkata')
                    open_hour, open_minute = 9, 15
                    close_hour, close_minute = 15, 30
                else:
                    market = 'US'
                    market_tz = pytz.timezone('America/New_York')
                    open_hour, open_minute = 9, 30
                    close_hour, close_minute = 16, 0

                current_time = datetime.now(market_tz)
                market_open = current_time.replace(hour=open_hour, minute=open_minute, second=0, microsecond=0)
                market_close = current_time.replace(hour=close_hour, minute=close_minute, second=0, microsecond=0)

                current_price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('previousClose')
                previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose')

                if market_open <= current_time <= market_close:
                    market_status = "OPEN"
                else:
                    market_status = "CLOSED"

                price_to_show = current_price or previous_close  # fallback display
                change_amount = 0
                change_percent = 0

                # Always calculate from current vs previous close
                if current_price and previous_close and previous_close != 0:
                    change_amount = current_price - previous_close
                    change_percent = (change_amount / previous_close) * 100


                chart_data = get_intraday_chart_data(symbol)

                change_amount = 0
                change_percent = 0
                if price_to_show and previous_close:
                    change_amount = price_to_show - previous_close
                    change_percent = (change_amount / previous_close) * 100

                result = {
                    'symbol': symbol,
                    'market': market,
                    'marketStatus': market_status,
                    'currentPrice': price_to_show,
                    'previousClose': previous_close,
                    'changeAmount': change_amount,
                    'changePercent': change_percent,
                    'chartData': chart_data,
                    'currency': info.get('currency', 'USD'),
                    'marketState': info.get('marketState', 'UNKNOWN')
                }

                results.append(result)

            except Exception as e:
                print(f"Error getting live data for {symbol}: {str(e)}")
                results.append({
                    'symbol': symbol,
                    'currentPrice': None,
                    'previousClose': None,
                    'changeAmount': 0,
                    'changePercent': 0,
                    'chartData': [],
                    'error': str(e)
                })

        return jsonify({'success': True, 'data': results})

    except Exception as e:
        print(f"Live prices API Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/calculate-returns', methods=['POST'])
def calculate_returns():
    try:
        data = request.get_json()
        stocks = data.get('stocks', [])

        if not stocks:
            return jsonify({'success': False, 'error': 'No stocks provided'})

        final_data = []
        total_invested = 0
        total_after_1y = 0
        total_after_3y = 0
        total_after_5y = 0

        for stock in stocks:
            ticker_symbol = stock['symbol']
            invest_amount = stock['investment']
            total_invested += invest_amount

            try:
                ticker = yf.Ticker(ticker_symbol)
                end_date = datetime.today()

                start_dates = {
                    "1 Year": end_date - timedelta(days=365),
                    "3 Years": end_date - timedelta(days=365 * 3),
                    "5 Years": end_date - timedelta(days=365 * 5)
                }

                stock_data = {
                    'Stock': ticker_symbol,
                    'Investment Amount': f"₹{invest_amount:.2f}"
                }

                for label, start_date in start_dates.items():
                    try:
                        hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))

                        if len(hist) == 0:
                            stock_data[f"{label} Return"] = 'Data not available'
                            continue

                        if 'Adj Close' in hist.columns and not hist['Adj Close'].empty:
                            first_close = hist['Adj Close'].iloc[0]
                            last_close = hist['Adj Close'].iloc[-1]
                        else:
                            first_close = hist['Close'].iloc[0]
                            last_close = hist['Close'].iloc[-1]

                        if pd.isna(first_close) or pd.isna(last_close) or first_close == 0:
                            stock_data[f"{label} Return"] = 'Data not available'
                            continue

                        returns = ((last_close - first_close) / first_close) * 100
                        stock_data[f"{label} Return"] = f"{returns:.2f}%"

                        if label == "1 Year":
                            total_after_1y += invest_amount * (1 + returns / 100)
                        if label == "3 Years":
                            total_after_3y += invest_amount * (1 + returns / 100)
                        if label == "5 Years":
                            total_after_5y += invest_amount * (1 + returns / 100)

                    except Exception as e:
                        print(f"Error calculating {label} return for {ticker_symbol}: {str(e)}")
                        stock_data[f"{label} Return"] = 'Data not available'

                final_data.append(stock_data)

            except Exception as e:
                print(f"Error processing stock {ticker_symbol}: {str(e)}")
                final_data.append({
                    'Stock': ticker_symbol,
                    'Investment Amount': f"₹{invest_amount:.2f}",
                    '1 Year Return': 'Error fetching data',
                    '3 Years Return': 'Error fetching data',
                    '5 Years Return': 'Error fetching data'
                })

        summary = {
            "total_invested": total_invested,
            "after_1y": {"returns": total_after_1y - total_invested, "total_value": total_after_1y},
            "after_3y": {"returns": total_after_3y - total_invested, "total_value": total_after_3y},
            "after_5y": {"returns": total_after_5y - total_invested, "total_value": total_after_5y}
        }

        return jsonify({'success': True, 'results': final_data, 'summary': summary})

    except Exception as e:
        print(f"API Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Portfolio API is running'})


@app.route('/stocks/search', methods=['GET'])
def search_stocks():
    query = request.args.get('q', '').upper()
    popular_stocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'ADBE', 'CRM',
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS'
    ]

    if query:
        filtered_stocks = [stock for stock in popular_stocks if query in stock]
        return jsonify({'stocks': filtered_stocks})

    return jsonify({'stocks': popular_stocks[:20]})


if __name__ == '__main__':
    print("Starting Portfolio API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
