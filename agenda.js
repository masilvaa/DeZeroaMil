// app.js - script principal
document.addEventListener("DOMContentLoaded", () => {
  // componentes DOM
  const tituloInput = document.getElementById("titulo");
  const materiaInput = document.getElementById("materia");
  const prioridadeInput = document.getElementById("prioridade");
  const dataInput = document.getElementById("data");
  const btnSalvar = document.getElementById("btn-salvar");
  const listaTarefasDiv = document.getElementById("lista-tarefas");
  const upcomingList = document.getElementById("upcoming-list");

  const diasContainer = document.getElementById("dias");
  const mesAnoEl = document.getElementById("mes-ano");
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");

  // estado
  let dataAtual = new Date();
  let tarefasByDate = {}; // { "2025-11-15": [ {..}, ... ] }

  // usuário (espera que sessionStorage['usuarioLogado'] exista com {id, nome})
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");

  // função para formatar YYYY-MM-DD
  function formatYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // ----------------- Firebase: ouvir mudanças das tarefas do usuário ---------------
  function startListeningTarefas() {
    if (!usuario || !usuario.id) {
      console.warn("Usuário não logado. As tarefas não serão carregadas.");
      tarefasByDate = {};
      renderTasksUI();
      renderCalendar(dataAtual);
      return;
    }

    const ref = db.ref(`tarefas/${usuario.id}`);
    ref.on("value", snapshot => {
      const val = snapshot.val() || {};
      // transforma em map por data
      tarefasByDate = {};
      Object.values(val).forEach(item => {
        const dateKey = item.data || item.dia; // compat
        if (!dateKey) return;
        if (!tarefasByDate[dateKey]) tarefasByDate[dateKey] = [];
        tarefasByDate[dateKey].push(item);
      });
      renderCalendar(dataAtual);
      renderTasksUI();
    }, error => {
      console.error("Erro ao ouvir tarefas:", error);
    });
  }

  // ----------------- salvar tarefa -----------------
  btnSalvar.addEventListener("click", () => {
    const titulo = tituloInput.value.trim();
    const materia = materiaInput.value;
    const prioridade = prioridadeInput.value;
    const data = dataInput.value; // yyyy-mm-dd

    if (!titulo || !materia) {
      alert("Preencha pelo menos título e matéria.");
      return;
    }

    if (!usuario || !usuario.id) {
      alert("Você precisa estar logado para salvar tarefas.");
      return;
    }

    const registro = {
      titulo,
      materia,
      prioridade,
      data: data || null,
      createdAt: new Date().toISOString()
    };

    db.ref(`tarefas/${usuario.id}`).push(registro)
      .then(() => {
        // limpar formulário
        tituloInput.value = "";
        materiaInput.value = "";
        prioridadeInput.value = "media";
        dataInput.value = "";
      })
      .catch(err => {
        console.error("Erro ao salvar:", err);
        alert("Erro ao salvar a tarefa.");
      });
  });

  // ----------------- calendar rendering -----------------
  function renderCalendar(data) {
    const ano = data.getFullYear();
    const mes = data.getMonth();

    // nome do mês
    mesAnoEl.textContent = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

    // primeiros cálculos
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    diasContainer.innerHTML = "";
    let linha = document.createElement("tr");

    // dias vazios
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      linha.appendChild(document.createElement("td"));
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const td = document.createElement("td");
      const dayNum = document.createElement("div");
      dayNum.className = "day-num";
      dayNum.textContent = dia;
      td.appendChild(dayNum);

      // data da célula
      const cellDate = new Date(ano, mes, dia);
      const key = formatYMD(cellDate);

      // marca hoje
      const hoje = new Date();
      if (key === formatYMD(hoje)) {
        td.classList.add("dia-hoje");
      }

      // se houver tarefas para a data, adiciona marcadores (até 2) e count
      const tasks = tarefasByDate[key] || [];
      tasks.slice(0, 2).forEach(t => {
        const tag = document.createElement("span");
        tag.className = "dia-tarefa";
        tag.textContent = t.titulo || t.tarefa || ("• " + t.materia);
        td.appendChild(tag);
      });
      if (tasks.length > 2) {
        const more = document.createElement("div");
        more.style.fontSize = "11px";
        more.style.marginTop = "4px";
        more.style.color = "#2f6fd1";
        more.textContent = `+${tasks.length - 2} mais`;
        td.appendChild(more);
      }

      // clique no dia: preenche o input de data e foca no título
      td.addEventListener("click", () => {
        dataInput.value = key;
        tituloInput.focus();
      });

      linha.appendChild(td);

      if ((primeiroDia.getDay() + dia) % 7 === 0) {
        diasContainer.appendChild(linha);
        linha = document.createElement("tr");
      }
    }
    // append última linha
    diasContainer.appendChild(linha);
  }

  // navegação do mês
  btnPrev.addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    renderCalendar(dataAtual);
  });
  btnNext.addEventListener("click", () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    renderCalendar(dataAtual);
  });

  // ----------------- render tasks in left list and upcoming -----------------
  function renderTasksUI() {
    // left list: todas as tarefas do usuário ordenadas por data (próximas)
    const all = [];
    Object.entries(tarefasByDate).forEach(([date, arr]) => {
      arr.forEach(t => all.push({ date, ...t }));
    });
    all.sort((a, b) => (a.date || a.createdAt || "").localeCompare(b.date || b.createdAt || ""));

    // lista principal
    listaTarefasDiv.innerHTML = "";
    all.forEach(item => {
      const row = document.createElement("div");
      row.className = "task-row";

      const meta = document.createElement("div");
      meta.innerHTML = `<div style="font-weight:600">${item.titulo}</div>
                        <div class="meta">${item.materia} • ${item.prioridade} ${item.date ? "• " + item.date : ""}</div>`;

      const right = document.createElement("div");
      const btnDel = document.createElement("button");
      btnDel.className = "delete-btn";
      btnDel.textContent = "🗑";
      btnDel.title = "Excluir";
      btnDel.onclick = () => {
        if (!usuario || !usuario.id) return alert("Usuário não logado");
        // Para excluir precisamos buscar o item exato no DB - aqui simplificamos:
        // Procurar em tarefas/<usuario.id> um registro com createdAt igual
        db.ref(`tarefas/${usuario.id}`).orderByChild("createdAt").equalTo(item.createdAt).once('value')
          .then(snap => {
            const val = snap.val();
            if (!val) return alert("Registro não encontrado");
            const key = Object.keys(val)[0];
            db.ref(`tarefas/${usuario.id}/${key}`).remove();
          });
      };

      right.appendChild(btnDel);
      row.appendChild(meta);
      row.appendChild(right);
      listaTarefasDiv.appendChild(row);
    });

    // upcoming: próximos 5
    upcomingList.innerHTML = "";
    const upcoming = all.filter(it => it.date).slice(0, 5);
    upcoming.forEach(it => {
      const item = document.createElement("div");
      item.className = "upcoming-item";
      item.innerHTML = `<div>${it.titulo}</div><small>${it.date}</small>`;
      upcomingList.appendChild(item);
    });
  }

  // inicialização
  startListeningTarefas();
  renderCalendar(dataAtual);
});
