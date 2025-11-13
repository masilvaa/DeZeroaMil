const modal = document.getElementById("modal");
const btnAbrir = document.getElementById("abrirModal");
const btnCancelar = document.getElementById("cancelar");
const btnSalvar = document.getElementById("salvar");
const lista = document.getElementById("listaTarefas");
const filtroMateria = document.getElementById("filtroMateria");

let tarefas = [];

btnAbrir.addEventListener("click", () => modal.style.display = "flex");
btnCancelar.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

btnSalvar.addEventListener("click", () => {
  const descricao = document.getElementById("descricao").value.trim();
  const materia = document.getElementById("materia").value;
  const prioridade = document.getElementById("prioridade").value;
  const data = document.getElementById("data").value;

  if (!descricao || !materia || !data) {
    alert("Preencha todos os campos.");
    return;
  }

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");
  if (!usuario) {
    alert("Usuário não identificado. Faça login novamente.");
    return;
  }

  const novaTarefa = {
    descricao,
    materia,
    prioridade,
    data,
    concluida: false,
    createdAt: new Date().toISOString(),
  };

  db.ref(`tarefas/${usuario.id}`).push(novaTarefa)
    .then(() => {
      alert("Tarefa adicionada!");
      modal.style.display = "none";
      document.getElementById("descricao").value = "";
      document.getElementById("data").value = "";
    })
    .catch((error) => {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a tarefa.");
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");
  if (!usuario) return;

  const ref = db.ref(`tarefas/${usuario.id}`);
  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    tarefas = data ? Object.values(data) : [];
    renderTarefas();
  });
});

function renderTarefas() {
  lista.innerHTML = "";

  const filtro = filtroMateria.value.trim().toLowerCase();
  const filtradas = filtro === "todas"
    ? tarefas
    : tarefas.filter(t => t.materia.toLowerCase().includes(filtro));

  if (filtradas.length === 0) {
    lista.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma tarefa planejada.</p>";
    return;
  }

  filtradas.forEach((tarefa, index) => {
    const div = document.createElement("div");
    div.classList.add("tarefa");

    div.innerHTML = `
      <div class="tarefa-info">
        <input type="checkbox" class="check" data-index="${index}" ${tarefa.concluida ? "checked" : ""}>
        <h3 class="${tarefa.concluida ? "concluida" : ""}">${tarefa.descricao}</h3>
        <div class="tags">
          <span class="tag">${tarefa.materia}</span>
          <span class="tag">Prioridade: ${tarefa.prioridade}</span>
          <span class="tag">📅 ${tarefa.data}</span>
        </div>
      </div>
      <button class="delete-btn" data-index="${index}">X</button>
    `;

    lista.appendChild(div);
  });
}

lista.addEventListener("change", (e) => {
  if (e.target.classList.contains("check")) {
    const index = e.target.dataset.index;
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    const tarefa = tarefas[index];
    const novaSituacao = e.target.checked;

    db.ref(`tarefas/${usuario.id}`)
      .orderByChild("descricao")
      .equalTo(tarefa.descricao)
      .once("value", (snapshot) => {
        snapshot.forEach((child) => {
          db.ref(`tarefas/${usuario.id}/${child.key}`).update({ concluida: novaSituacao });
        });
      });
  }
});

lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    const tarefa = tarefas[index];

    if (confirm(`Deseja realmente excluir a tarefa: "${tarefa.descricao}"?`)) {
      db.ref(`tarefas/${usuario.id}`)
        .orderByChild("descricao")
        .equalTo(tarefa.descricao)
        .once("value", snapshot => {
          snapshot.forEach(child => {
            db.ref(`tarefas/${usuario.id}/${child.key}`).remove();
          });
        });
    }
  }
});

filtroMateria.addEventListener("change", renderTarefas);