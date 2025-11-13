const addBtn = document.getElementById("add-btn");
const form = document.getElementById("formulario");
const salvar = document.getElementById("salvar");
const tabela = document.getElementById("tabela").getElementsByTagName("tbody")[0];

addBtn.addEventListener("click", () => {
  form.style.display = form.style.display === "none" ? "block" : "none";
});


salvar.addEventListener("click", () => {
  const data = document.getElementById("data").value; // yyyy-mm-dd
  const materia = document.getElementById("materia").value;
  const tarefa = document.getElementById("tarefa").value;

  if (!data || !materia || !tarefa) {
    alert("Preencha todos os campos para adicionar a tarefa.");
    return;
  }

  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));
  if (!usuario || !usuario.id) {
    alert("Usuário não encontrado. Faça login novamente.");
    return;
  }

  const registrobanco = { 
    data, 
    materia, 
    tarefa 
  };
  
  db.ref(`tarefas/${usuario.id}`).push(registrobanco)
    .then(() => {
      alert(`Tarefa adicionada para ${data}!`);
      form.style.display = "none";
      document.getElementById("tarefa").value = "";
      document.getElementById("data").value = "";
    })
    .catch(error => {
      console.error("Erro ao salvar tarefa:", error);
      alert("Erro ao salvar a tarefa no banco.");
    });
});

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
