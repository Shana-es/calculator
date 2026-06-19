let display = document.getElementById('display');
let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

function updateDisplay() {
    display.value = currentInput;
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
}

function appendDecimal() {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function deleteLastChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function calculate() {
    if (operator === null || shouldResetDisplay) {
        return;
    }

    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) {
        return;
    }

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : 0;
            if (current === 0) {
                currentInput = 'Error';
                updateDisplay();
                clearDisplay();
                return;
            }
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendDecimal();
    if (e.key === '+' || e.key === '-') appendOperator(e.key);
    if (e.key === '*') {
        e.preventDefault();
        appendOperator('*');
    }
    if (e.key === '/') {
        e.preventDefault();
        appendOperator('/');
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    }
    if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLastChar();
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        clearDisplay();
    }
});

// Initialize display
updateDisplay();