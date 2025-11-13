const addBtn = document.getElementById("add-btn");
const form = document.getElementById("formulario");
const salvar = document.getElementById("salvar");
const tabela = document.getElementById("tabela").getElementsByTagName("tbody")[0];

addBtn.addEventListener("click", () => {
  form.style.display = form.style.display === "none" ? "block" : "none";
});

salvar.addEventListener("click", () => {
  const dia = parseInt(document.getElementById("dia").value);
  const materia = document.getElementById("materia").value;
  const tarefa = document.getElementById("tarefa").value;

  if (!dia || !materia || !tarefa) {
    alert("Preencha todos os campos para adicionar a tarefa.");
    return;
  }

  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

  const registrobanco = { 
    dia, 
    materia, 
    tarefa 
  };
  
  db.ref(`tarefas/${usuario.id}`).push(registrobanco)
    .then(() => {
      alert("Tarefa adicionada!");
      form.style.display = "none";
      document.getElementById("tarefa").value = "";
    })
    .catch(error => {
      console.error("Erro ao salvar tarefa:", error);
      alert("Erro ao salvar a tarefa no banco.");
    });
});


const usuario = JSON.parse(sessionStorage.getItem('usuarioLogado'));

if (usuario) {
  const tarefasRef = db.ref(`tarefas/${usuario.id}`);

  tarefasRef.on("value", (snapshot) => {
    const data = snapshot.val();

    for (let i = 0; i < tabela.rows.length; i++) {
      for (let j = 0; j < tabela.rows[i].cells.length; j++) {
        tabela.rows[i].cells[j].innerHTML = "";
      }
    }

    if (data) {
      Object.entries(data).forEach(([id, tarefa]) => {
        for (let i = 0; i < tabela.rows.length; i++) {
          const celula = tabela.rows[i].cells[tarefa.dia];
          if (celula.innerHTML.trim() === "") {
            const span = document.createElement("span");
            span.textContent = `${tarefa.tarefa} - ${tarefa.materia}`;

            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "x";
            btnExcluir.classList.add("btn-excluir");
            btnExcluir.style.marginLeft = "8px";
            btnExcluir.onclick = () => {
              if (confirm("Deseja excluir esta tarefa?")) {
                db.ref(`tarefas/${usuario.id}`).child(id).remove();
              }
            };

            celula.appendChild(span);
            celula.appendChild(btnExcluir);
            break;
          }
        }
      });
    }
  });
} 
