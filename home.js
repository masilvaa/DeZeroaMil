document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado") || "null");

  const ref = db.ref(`tarefas/${usuario.id}`);
  const barra = document.getElementById("progresso");
  const texto = document.getElementById("porcentagem");

  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      barra.style.width = "0%";
      texto.textContent = "0% (Nenhuma tarefa)";
      return;
    }

    const tarefas = Object.values(data);
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;

    const porcentagem = Math.round((concluidas / total) * 100);
    barra.style.width = `${porcentagem}%`;
    texto.textContent = `${porcentagem}% concluído`;
  });
});

function renderTarefas() {
  lista.innerHTML = "";

  const filtro = filtroMateria.value;
  const filtradas = filtro === "todas" ? tarefas : tarefas.filter(t => t.materia === filtro);

  if (filtradas.length === 0) {
    lista.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma tarefa planejada.</p>";
    return;
  }

  filtradas.forEach((tarefa, index) => {
  const div = document.createElement("div");
  div.classList.add("tarefa", `prioridade-${tarefa.prioridade.toLowerCase()}`);

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
  `;

  lista.appendChild(div);
});
}