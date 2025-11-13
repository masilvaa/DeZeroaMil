document.addEventListener("DOMContentLoaded", () => {
  const diasContainer = document.getElementById("dias");
  const mesAnoEl = document.getElementById("mes-ano");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");
  let dataAtual = new Date();
  let tarefas = {};

  function formatYMD(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }

  function renderCalendar() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    mesAnoEl.textContent = dataAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    diasContainer.innerHTML = "";

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    let linha = document.createElement("tr");

    for (let i = 0; i < primeiroDia.getDay(); i++) linha.appendChild(document.createElement("td"));

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const td = document.createElement("td");
      const num = document.createElement("div");
      num.className = "day-num";
      num.textContent = dia;
      td.appendChild(num);

      const key = formatYMD(new Date(ano, mes, dia));
      if (tarefas[key]) {
        const dot = document.createElement("div");
        dot.className = "tarefa-dot";
        td.appendChild(dot);
        td.title = tarefas[key].map(t => t.titulo).join(", ");
      }

      const hoje = new Date();
      if (key === formatYMD(hoje)) td.classList.add("dia-hoje");

      linha.appendChild(td);
      if ((primeiroDia.getDay() + dia) % 7 === 0) {
        diasContainer.appendChild(linha);
        linha = document.createElement("tr");
      }
    }
    diasContainer.appendChild(linha);
  }

  function carregarTarefas() {
    if (!usuario || !usuario.id) {
      console.warn("Sem usuário logado");
      return;
    }
    db.ref(`tarefas/${usuario.id}`).on("value", snap => {
      const val = snap.val() || {};
      tarefas = {};
      Object.values(val).forEach(t => {
        if (!t.data) return;
        if (!tarefas[t.data]) tarefas[t.data] = [];
        tarefas[t.data].push(t);
      });
      renderCalendar();
    });
  }

  btnPrev.onclick = () => { dataAtual.setMonth(dataAtual.getMonth() - 1); renderCalendar(); };
  btnNext.onclick = () => { dataAtual.setMonth(dataAtual.getMonth() + 1); renderCalendar(); };

  carregarTarefas();
  renderCalendar();
});
