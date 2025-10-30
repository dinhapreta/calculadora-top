/*script.js
Lógica da Calculadora Top 💙
Aqui controlamos os cliques, cálculos e o tema claro/escuro.
*/

// Seleciona elementos do HTML
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");
const themeBtn = document.getElementById("theme-toggle");

// ========== LÓGICA DOS BOTÕES ===========
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const value = btn.textContent;

        if (value === "C"){
            // Limpa tudo
            display.value = "";
        } else if(value === "⌫"){
            // Apaga o último caractere
            display.value = display.value.slice(0, -1);
        } else if (value === "="){
// Tenta calcular a expressão
try{
    display.value = eval(display.value); //cuidado: eval é só para aprendizado
} catch {
    display.value = "Erro";
}
} else {
    //adiciona o valor no visor
    display.value += value;
}   
 });
}
);

// ============= TEMA CLARO/ESCURO ================

// Ao carregar, verifica se o tema salvo é claro
if (localStorage.getItem("theme") === "light"){
    document.body.classList.add("light");
    themeBtn.textContent = "🌞";
}

// Quando o Botão é clicado
themeBtn.addEventListener("click", () => {
    //Alterna a classe "light" no body
    document.body.classList.toggle("light");

    //Verifica se agora está no tema claro
    const isLight = document.body.classList.contains("light");

    //Muda o ícone do botão
    themeBtn.textContent = isLight ? "🌞" : "🌙";

    //Salva a preferência no navegador
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// =============================
// 🕓 Atualiza o ano automaticamente no rodapé
// =============================

// Pega o elemento <span id="year">
const yearSpan = document.getElementById("year");

// Pega o ano atual do sistema
const currentYear = new Date().getFullYear();

// Insere o ano no rodapé
if (yearSpan) {
  yearSpan.textContent = currentYear;
}

// =============================
// 💬 Mensagem personalizada conforme o horário
// =============================

// Pega o elemento do parágrafo
const greetingEl = document.getElementById("greeting");

// Cria um objeto Date para pegar a hora atual
const now = new Date();
const hour = now.getHours(); // Retorna um número de 0 a 23

// Define a mensagem com base na hora do dia
let message = "";

if (hour >= 5 && hour < 12) {
  message = "☀️ Tenha um ótimo dia!";
} else if (hour >= 12 && hour < 18) {
  message = "🌼 Boa tarde!";
} else {
  message = "🌙 Tenha uma ótima noite!";
}

// Insere a mensagem no rodapé
if (greetingEl) {
  greetingEl.textContent = message;
}

// =============================
// 📟 Suporte a teclado
// =============================
document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Números e operadores válidos
    const validKeys = "0123456789+-*/().";

    if (validKeys.includes(key)) {
        display.value += key;
    } else if (key === "Enter") {
        // Calcula a expressão
        try {
            display.value = eval(display.value);
        } catch {
            display.value = "Erro";
        }
    } else if (key === "Backspace") {
        // Apaga o último caractere
        display.value = display.value.slice(0, -1);
    } else if (key.toLowerCase() === "c") {
        // Limpa tudo
        display.value = "";
    }
});
