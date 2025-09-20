const tabela = document.getElementById("tabela-agenda").getElementsByTagName("tbody")[0];
const listaTarefas = document.getElementById("lista-tarefas");

const tarefasRef = db.ref("tarefas");

tarefasRef.on("value", snapshot => {
    const data = snapshot.val();

    for (let i = 0; i < tabela.rows.length; i++) {
        for (let j = 0; j < tabela.rows[i].cells.length; j++) {
            tabela.rows[i].cells[j].innerHTML = "";
        }
    }

    listaTarefas.innerHTML = "";

    if (data) {
        Object.entries(data).forEach(([id, tarefa]) => {
            for (let i = 0; i < tabela.rows.length; i++) {
                const celula = tabela.rows[i].cells[tarefa.dia];
                if (celula.innerHTML.trim() === "") {
                    const span = document.createElement("span");
                    span.textContent = `${tarefa.tarefa} - ${tarefa.materia}`;
                    celula.appendChild(span);
                    break;
                }
            }

            const div = document.createElement("div");
            div.textContent = `${tarefa.tarefa} - ${tarefa.materia}`;
            listaTarefas.appendChild(div);
        });
    }
});