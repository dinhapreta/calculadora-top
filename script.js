/* ============================================================
   📘 script.js — Calculadora Top 💙
   ------------------------------------------------------------
  
   🔹 Tudo funcionando como calculadora real:
       • Porcentagem real (base no subtotal em + e -; fração em * e /)
       • Raiz (√), quadrado (x²) e potência (^)
       • Inversão de sinal (+/-) com parênteses
       • Histórico legível (mostra a expressão do usuário)
       • Suporte ao teclado (Enter, Backspace, %, etc.)
   ============================================================ */


/* =================== 🔹 ELEMENTOS DO HTML =================== */
// Conectamos os elementos do HTML ao JavaScript
const display = document.getElementById("display");      // visor principal
const buttons = document.querySelectorAll(".btn");        // todos os botões da calculadora
const themeBtn = document.getElementById("theme-toggle"); // botão de alternar tema
const historyList = document.getElementById("history-list"); // <ul> do histórico


/* =================== 🔹 LÓGICA DOS BOTÕES (CLIQUE) =================== */
// Controla o que acontece quando clicamos em cada botão da calculadora
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;

    // Botão "=" → executa o cálculo
    if (value === "=") {
      calculate();
    }
    // Botão "+/-" → inverte o sinal do último número e coloca entre parênteses
    else if (value === "+/-") {
      invertSignal();
    }
    // Operadores especiais (inserimos como texto no display)
    else if (value === "√" || value === "x²" || value === "^") {
      display.value += value;
    }
    // Limpar visor
    else if (value === "C") {
      display.value = "";
    }
    // Apagar último caractere
    else if (value === "⌫") {
      display.value = display.value.slice(0, -1);
    }
    // Números e operadores comuns
    else {
      display.value += value;
    }
  });
});


/* =================== 🔹 FUNÇÃO PRINCIPAL DE CÁLCULO =================== */
// Responsável por transformar a expressão do usuário em algo que o JS entende,
// aplicar as regras de % “reais”, √, x², ^, e então avaliar.
function calculate() {
  // Guardamos a expressão ORIGINAL (para exibir no histórico)
  const originalExpression = display.value;
  // Fazemos uma CÓPIA para processar internamente
  let expr = originalExpression;

  try {
    // ---------- NORMALIZAÇÃO ----------
    // Troca vírgula por ponto (casas decimais) e remove espaços extras
    expr = expr.replace(/,/g, ".").replace(/\s+/g, "");

    // ---------- RAIZ QUADRADA ----------
    // Casos:
    //   √9          → Math.sqrt(9)
    //   √(3+6)      → Math.sqrt(3+6)
    //   9√3         → 9 * Math.sqrt(3)  (número seguido de √n)
    expr = expr.replace(/(\d+)√(\d+)/g, "$1*Math.sqrt($2)");
    expr = expr.replace(/√\(/g, "Math.sqrt(");
    expr = expr.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");

    // ---------- QUADRADO (x²) ----------
    // Casos:
    //   5x²         → Math.pow(5,2)
    //   (2+3)x²     → Math.pow((2+3),2)  (tratamos ")x²" logo abaixo)
    expr = expr.replace(/(\d+(\.\d+)?)x²/g, "Math.pow($1,2)");
    expr = expr.replace(/\)x²/g, ",2)"); // "(… )x²" vira "(… ,2)"

    // ---------- POTÊNCIA GERAL (^) ----------
    // Casos:
    //   2^3         → Math.pow(2,3)
    //   (1+1)^3     → Math.pow((1+1),3)
    expr = expr.replace(/(\d+(\.\d+)?|\))\^(\d+(\.\d+)?|\()/g, (m) => {
      const parts = m.split("^");
      return `Math.pow(${parts[0]},${parts[1]})`;
    });

    // ---------- PORCENTAGEM EM * e / (regra padrão) ----------
    //   50*10%  → 50*(10/100)
    //   200/10% → 200/(10/100)
    expr = expr.replace(
      /(\d+(\.\d+)?|\([^()]+\))([*/])(\d+(\.\d+)?|\([^()]+\))%/g,
      (match, a, _a2, op, b) => `${a}${op}(${b}/100)`
    );

    // ---------- PORCENTAGEM EM + e - (como calculadora real) ----------
    // Processamos da ESQUERDA → DIREITA:
    // Em cada “±N%”, calculamos N% sobre o SUBTOTAL até aquele ponto.
    // Ex.: 100+20-10%:
    //   • encontra "+20%"? não — é número puro
    //   • encontra "-10%" quando subtotal é 120 → substitui por "-(120*10/100)"
    //   • resultado final = 108
    while (true) {
      const m = expr.match(/([+\-])(\d+(\.\d+)?)%/);
      if (!m) break;

      const opIndex = m.index;               // posição do operador
      const op = m[1];                       // "+" ou "-"
      const perc = m[2];                     // valor da porcentagem
      const prefix = expr.slice(0, opIndex); // tudo que vem antes
      const suffix = expr.slice(opIndex + m[0].length); // tudo que vem depois

      // Avalia o subtotal (prefixo) já com as transformações anteriores
      let base;
      try { base = eval(prefix); } catch { base = 0; }

      // Substitui "+N%" → "+(base*N/100)"  |  "-N%" → "-(base*N/100)"
      const replacement = `${op}(${base}*${perc}/100)`;
      expr = prefix + replacement + suffix;
    }

    // ---------- AVALIAÇÃO FINAL ----------
    const result = eval(expr); // 👀 usamos eval aqui apenas para fins didáticos
    display.value = result;

    // ---------- HISTÓRICO LEGÍVEL ----------
    // Mostra exatamente o que o usuário digitou + o resultado
    if (historyList) {
      const item = document.createElement("li");
      item.textContent = `${originalExpression} = ${result}`;
      historyList.appendChild(item);
      historyList.scrollTop = historyList.scrollHeight; // mantém scroll no final
    }

  } catch (err) {
    // Se a expressão estiver inválida (parênteses faltando, etc.)
    display.value = "Erro";
  }
}


/* =================== 🔹 FUNÇÃO "+/-" (INVERTE SINAL COM PARÊNTESES) =================== */
// Encontra o ÚLTIMO número da expressão e inverte o sinal.
// Ex.: "10+45"  → "10+(-45)"
//      "(-3)+2" → "(-3)+(-2)" (mantém estilo consistente)
function invertSignal() {
  const s = display.value;
  if (!s) return;

  // Captura o prefixo e o último número (com decimais possíveis)
  const m = s.match(/(.*?)(-?\d+(\.\d+)?)\s*$/);
  if (!m) return;

  const prefix = m[1];
  const numStr = m[2];
  let num = parseFloat(numStr);
  if (isNaN(num)) return;

  num = -num; // inverte o sinal

  // Garante parênteses para evitar ambiguidade em expressões
  display.value = `${prefix}(${num})`;
}


/* =================== 🔹 TEMA CLARO/ESCURO =================== */
// Ao carregar, aplica o último tema salvo
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeBtn.textContent = "🌞";
}

// Alterna o tema e salva preferência
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeBtn.textContent = isLight ? "🌞" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});


/* =================== 🔹 ANO NO RODAPÉ =================== */
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();


/* =================== 🔹 MENSAGEM DINÂMICA (CONFORME HORÁRIO) =================== */
const greetingEl = document.getElementById("greeting");
const hour = new Date().getHours();
let message = "";

if (hour >= 5 && hour < 12) message = "☀️ Tenha um ótimo dia!";
else if (hour >= 12 && hour < 18) message = "🌼 Boa tarde!";
else message = "🌙 Tenha uma ótima noite!";

if (greetingEl) greetingEl.textContent = message;


/* =================== 🔹 SUPORTE AO TECLADO =================== */
// Permite digitar com o teclado: números, operadores e ações principais
document.addEventListener("keydown", (event) => {
  const key = event.key;
  const validKeys = "0123456789+-*/().";

  // Números e operadores
  if (validKeys.includes(key)) {
    display.value += key;
  }
  // Enter / NumpadEnter → calcula
  else if (key === "Enter" || key === "NumpadEnter") {
    calculate();
  }
  // Backspace → apaga último caractere
  else if (key === "Backspace") {
    display.value = display.value.slice(0, -1);
  }
  // C/c → limpa visor
  else if (key.toLowerCase() === "c") {
    display.value = "";
  }
  // % → adiciona porcentagem
  else if (key === "%") {
    display.value += "%";
  }
});
