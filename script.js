let lastPrice = null; // Track the last price to compare for up/down trend

// Fetch data from the CoinGecko API (or another API for live crypto data)
const cryptoSymbol = 'bitcoin'; // You can change this to any crypto symbol you like

async function fetchCryptoData() {
    try {
        // Fetching current price for Bitcoin
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoSymbol}&vs_currencies=usd`);
        const priceData = await priceResponse.json();
        const price = priceData[cryptoSymbol].usd;

        // Display the current price
        const priceElement = document.getElementById('crypto-price');
        priceElement.textContent = `$${price}`;

        // Compare the current price with the last price to detect up or down
        if (lastPrice !== null) {
            const priceTrendElement = document.getElementById('price-trend');
            if (price > lastPrice) {
                priceTrendElement.textContent = '🔼 Price is up';
                priceTrendElement.style.color = 'green';
            } else if (price < lastPrice) {
                priceTrendElement.textContent = '🔽 Price is down';
                priceTrendElement.style.color = 'red';
            } else {
                priceTrendElement.textContent = 'Price is stable';
                priceTrendElement.style.color = 'gray';
            }
        }

        // Update the last price for the next comparison
        lastPrice = price;

        // Fetching historical data for SMA calculation (still using 200 days for SMA)
        const historicalResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoSymbol}/market_chart?vs_currency=usd&days=200`);
        const historicalData = await historicalResponse.json();

        const closingPrices = historicalData.prices.map(price => price[1]); // Extracting closing prices

        // Calculate Simple Moving Averages (SMA)
        const sma50 = calculateSMA(closingPrices, 50);
        const sma200 = calculateSMA(closingPrices, 200);

        // Display SMA values
        document.getElementById('sma50').textContent = sma50.toFixed(2);
        document.getElementById('sma200').textContent = sma200.toFixed(2);

        // Make a recommendation based on the SMAs
        makeRecommendation(sma50, sma200);

    } catch (error) {
        console.error('Error fetching crypto data:', error);
    }
}

// Function to calculate Simple Moving Average (SMA)
function calculateSMA(prices, period) {
    const smaArray = [];
    for (let i = period - 1; i < prices.length; i++) {
        const periodPrices = prices.slice(i - period + 1, i + 1);
        const sum = periodPrices.reduce((a, b) => a + b, 0);
        smaArray.push(sum / period);
    }
    return smaArray[smaArray.length - 1]; // Return the last calculated SMA
}

// Function to make a recommendation based on SMA values
function makeRecommendation(sma50, sma200) {
    const recommendationElement = document.getElementById('recommendation');
    if (sma50 > sma200) {
        recommendationElement.textContent = 'Buy';
        recommendationElement.style.color = 'green';
    } else if (sma50 < sma200) {
        recommendationElement.textContent = 'Sell';
        recommendationElement.style.color = 'red';
    } else {
        recommendationElement.textContent = 'Hold';
        recommendationElement.style.color = 'gray';
    }
}

// Call the function to fetch data on page load
fetchCryptoData();

// Refresh the data every 1 minute (60,000 milliseconds)
setInterval(fetchCryptoData, 60000);