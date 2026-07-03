const display = document.getElementById("display");
const historyEl = document.getElementById("history");
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

let currentInput = "0";
let previousInput = "";
let operator = null;
let shouldResetDisplay = false;
let hasError = false;
let lastExpression = ""; // shown in history after "="

const OP_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/* ---------- rendering ---------- */

function render() {
  display.value = currentInput;
  display.classList.toggle("error", hasError);

  if (hasError) {
    historyEl.textContent = "";
  } else if (operator !== null) {
    historyEl.textContent = `${format(previousInput)} ${OP_SYMBOLS[operator]}`;
  } else {
    historyEl.textContent = lastExpression;
  }

  // Highlight the active operator
  document.querySelectorAll(".btn.operator").forEach((b) => b.classList.remove("active"));
  if (operator !== null && shouldResetDisplay) {
    const label = OP_SYMBOLS[operator];
    document.querySelectorAll(".btn.operator").forEach((b) => {
      if (b.textContent.trim() === label) b.classList.add("active");
    });
  }
}

function format(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return value;
  // Group thousands, keep decimals intact
  return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
}

/* ---------- input ---------- */

function clearErrorIfNeeded() {
  if (hasError) clearAll();
}

function appendNumber(num) {
  clearErrorIfNeeded();
  if (shouldResetDisplay) {
    currentInput = num;
    shouldResetDisplay = false;
  } else if (currentInput === "0") {
    currentInput = num;
  } else {
    currentInput += num;
  }
  render();
}

function appendDecimal() {
  clearErrorIfNeeded();
  if (shouldResetDisplay) {
    currentInput = "0.";
    shouldResetDisplay = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  render();
}

function appendOperator(op) {
  clearErrorIfNeeded();
  // Chain calculations: if an operator is already pending, evaluate first.
  if (operator !== null && !shouldResetDisplay) {
    calculate({ keepChaining: true });
    if (hasError) return;
  }
  previousInput = currentInput;
  operator = op;
  shouldResetDisplay = true;
  lastExpression = "";
  render();
}

function toggleSign() {
  clearErrorIfNeeded();
  if (currentInput === "0") return;
  currentInput = currentInput.startsWith("-")
    ? currentInput.slice(1)
    : "-" + currentInput;
  render();
}

function percent() {
  clearErrorIfNeeded();
  const value = parseFloat(currentInput);
  if (isNaN(value)) return;
  // Mid-operation, percent is relative to the previous operand (e.g. 200 + 10% = 220).
  // Standalone, percent just divides by 100 (50% = 0.5).
  const base = operator !== null ? parseFloat(previousInput) : 1;
  currentInput = roundResult((value / 100) * base).toString();
  // Mid-operation: keep the operator live so "=" completes (200 + 10% = 220).
  // Standalone: treat the result as final.
  shouldResetDisplay = operator === null;
  render();
}

function deleteLastChar() {
  clearErrorIfNeeded();
  if (shouldResetDisplay) return;
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  render();
}

function clearAll() {
  currentInput = "0";
  previousInput = "";
  operator = null;
  shouldResetDisplay = false;
  hasError = false;
  lastExpression = "";
  render();
}

/* ---------- math ---------- */

function roundResult(n) {
  // Avoid floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  return Math.round((n + Number.EPSILON) * 1e10) / 1e10;
}

function showError(message) {
  currentInput = message;
  previousInput = "";
  operator = null;
  shouldResetDisplay = true;
  hasError = true;
  lastExpression = "";
  render();
}

function calculate({ keepChaining = false } = {}) {
  if (operator === null || shouldResetDisplay) return;

  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  const opSym = OP_SYMBOLS[operator];
  let result;
  switch (operator) {
    case "+": result = prev + current; break;
    case "-": result = prev - current; break;
    case "*": result = prev * current; break;
    case "/":
      if (current === 0) { showError("Cannot ÷ 0"); return; }
      result = prev / current;
      break;
    default: return;
  }

  result = roundResult(result);
  if (!keepChaining) {
    lastExpression = `${format(previousInput)} ${opSym} ${format(currentInput)} =`;
  }
  currentInput = result.toString();
  operator = null;
  shouldResetDisplay = true;
  render();
}

/* ---------- theme ---------- */

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
}
themeToggle.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* ---------- keyboard ---------- */

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
  else if (e.key === ".") appendDecimal();
  else if (e.key === "+" || e.key === "-") appendOperator(e.key);
  else if (e.key === "*") { e.preventDefault(); appendOperator("*"); }
  else if (e.key === "/") { e.preventDefault(); appendOperator("/"); }
  else if (e.key === "%") percent();
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); calculate(); }
  else if (e.key === "Backspace") { e.preventDefault(); deleteLastChar(); }
  else if (e.key === "Escape") { e.preventDefault(); clearAll(); }
});

render();
