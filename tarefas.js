const listaAtivas = document.getElementById("lista-tarefas");
const listaConcluidas = document.getElementById("lista-concluidas");

const tarefasRef = db.ref("tarefas");
const concluidasRef = db.ref("tarefasConcluidas");

tarefasRef.on("value", snapshot => {
  listaAtivas.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  Object.entries(data).forEach(([id, tarefa]) => {
    const div = document.createElement("div");
    div.classList.add("tarefa-card");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        concluidasRef.push(tarefa);
        db.ref("tarefas").child(id).remove();
      }
    });

    div.textContent = `${tarefa.tarefa} - ${tarefa.materia}`;
    div.prepend(checkbox);
    listaAtivas.appendChild(div);
  });
});

concluidasRef.on("value", snapshot => {
  listaConcluidas.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  Object.values(data).forEach(tarefa => {
    const div = document.createElement("div");
    div.classList.add("tarefa-card");
    div.textContent = `${tarefa.tarefa} - ${tarefa.materia}`;
    listaConcluidas.appendChild(div);
  });
});
