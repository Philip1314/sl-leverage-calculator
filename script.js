document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get input elements
    const positionTypeSelect = document.getElementById('positionType');
    const entryPriceInput = document.getElementById('entryPrice');
    const takeProfitInput = document.getElementById('takeProfit');
    const riskPercentInput = document.getElementById('riskPercent');

    // Get output elements
    const stopLossPriceEl = document.getElementById('stopLossPrice');
    const stopLossPercentEl = document.getElementById('stopLossPercent');
    const leverageEl = document.getElementById('leverage');
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    // Clear previous results and errors
    resultsDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Get values and convert to numbers
    const positionType = positionTypeSelect.value; // 'long' or 'short'
    const entryPrice = parseFloat(entryPriceInput.value);
    const takeProfit = parseFloat(takeProfitInput.value);
    const preferredRiskPercent = parseFloat(riskPercentInput.value);

    // --- Input Validation (Basic) ---
    if (isNaN(entryPrice) || isNaN(takeProfit) || isNaN(preferredRiskPercent)) {
        errorDiv.textContent = 'Error: Please fill in all fields with valid numbers.';
        errorDiv.style.display = 'block';
        return;
    }
    if (entryPrice <= 0 || takeProfit <= 0 || preferredRiskPercent <= 0) {
        errorDiv.textContent = 'Error: Prices and risk percentage must be positive numbers.';
        errorDiv.style.display = 'block';
        return;
    }
     if (entryPrice === takeProfit) {
        errorDiv.textContent = 'Error: Entry Price and Take Profit cannot be the same.';
        errorDiv.style.display = 'block';
        return;
    }


    // --- Declare variables for calculation ---
    let rewardDistance = 0;
    let riskDistance = 0;
    let stopLossPrice = 0;
    let stopLossPercentage = 0;

    // --- Calculations based on Position Type ---
    if (positionType === 'long') {
        // Validation specific to Long
        if (takeProfit <= entryPrice) {
            errorDiv.textContent = 'Error: For LONG, Take Profit must be higher than Entry Price.';
            errorDiv.style.display = 'block';
            return;
        }

        // Step 1: Calculate the Reward distance
        rewardDistance = takeProfit - entryPrice;
        // Step 2: Calculate the Risk distance (assuming RRR = 1:2)
        riskDistance = rewardDistance / 2;
        // Step 3: Calculate Stop Loss price
        stopLossPrice = entryPrice - riskDistance;
        // Step 4: Calculate Stop Loss Percentage
         if (entryPrice !== 0 && stopLossPrice < entryPrice) { // Ensure SL is below entry for calculation
            stopLossPercentage = ((entryPrice - stopLossPrice) / entryPrice) * 100;
        } else if (entryPrice === 0){
            errorDiv.textContent = 'Error: Entry price cannot be zero.';
            errorDiv.style.display = 'block';
            return;
        } else {
            // This case should ideally not happen with TP > Entry and Risk > 0
            stopLossPercentage = 0;
        }

    } else if (positionType === 'short') {
         // Validation specific to Short
        if (takeProfit >= entryPrice) {
            errorDiv.textContent = 'Error: For SHORT, Take Profit must be lower than Entry Price.';
            errorDiv.style.display = 'block';
            return;
        }

        // Step 1: Calculate the Reward distance
        rewardDistance = entryPrice - takeProfit; // Reversed for short
         // Step 2: Calculate the Risk distance (assuming RRR = 1:2)
        riskDistance = rewardDistance / 2;
        // Step 3: Calculate Stop Loss price
        stopLossPrice = entryPrice + riskDistance; // Add risk for short SL
        // Step 4: Calculate Stop Loss Percentage
         if (entryPrice !== 0 && stopLossPrice > entryPrice) { // Ensure SL is above entry
            stopLossPercentage = ((stopLossPrice - entryPrice) / entryPrice) * 100; // Reversed for short %
        } else if (entryPrice === 0){
            errorDiv.textContent = 'Error: Entry price cannot be zero.';
            errorDiv.style.display = 'block';
            return;
        } else {
            // This case should ideally not happen with TP < Entry and Risk > 0
            stopLossPercentage = 0;
        }
    }

    // --- Final Checks & Leverage Calculation ---
     if (stopLossPercentage <= 0) {
        errorDiv.textContent = 'Error: Calculated Stop Loss Percentage is zero or negative. Cannot calculate leverage. Check inputs or RRR logic.';
        errorDiv.style.display = 'block';
        // Optionally display the potentially invalid SL price anyway
        resultsDiv.style.display = 'block';
        stopLossPriceEl.textContent = stopLossPrice;
        stopLossPercentEl.textContent = stopLossPercentage.toFixed(2); // Rounded to 2 decimals
        leverageEl.textContent = 'N/A';
        return; // Stop before leverage calculation
    }

    // Step 5: Calculate Leverage (same formula for both)
    const leverage = preferredRiskPercent / stopLossPercentage;

    // --- Display Results ---
    stopLossPriceEl.textContent = stopLossPrice; // No rounding
    stopLossPercentEl.textContent = stopLossPercentage.toFixed(2); // Rounded to 2 decimals
    leverageEl.textContent = leverage.toFixed(2); // Rounded to 2 decimals
    resultsDiv.style.display = 'block'; // Show the results area

});