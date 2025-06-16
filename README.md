# 📈 Stock Portfolio Chrome Extension

A lightweight Chrome extension to help you **track your stock investments**, **view live percentage changes**, and **visualize your profit/loss with graphs**. Built with a React-based frontend and a Python backend powered by the [`yfinance`](https://pypi.org/project/yfinance/) library.

---

## 🚀 Features

- 🔍 **Live Stock Tracking**  
  Select from 200+ popular US stocks using a dropdown menu.

- ➕ **Add Stocks to Portfolio**  
  Add stocks with your investment details – all data is saved locally for persistence.

- 📉 **Live Price Updates**  
  View current price, daily % change, and more via real-time data from Yahoo Finance.

- 💹 **Profit/Loss Calculation**  
  Calculates total return based on your initial investment and current price.

- 📊 **Interactive Graphs**  
  See historical stock performance visualized via charts.

---

## 🧩 Tech Stack

- **Frontend**: HTML/CSS + JavaScript (React via Vite)
- **Backend**: Python + `yfinance`
- **Data Handling**: LocalStorage + JSON communication
- **Packaging**: Chrome Extension API

---

## 🛠️ Installation

### 🔧 Prerequisites

- Python 3.8+
- Chrome Browser
- Git

### 💻 Backend Setup

```bash
git clone https://github.com/your-username/stock-portfolio-extension.git
cd stock-portfolio-extension/backend
pip install -r requirements.txt
python app.py
