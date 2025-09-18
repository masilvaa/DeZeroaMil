function cadastrarconta() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  if (!nome || !email || !senha){
    alert("Preencha todos os campos para efetuar o cadastro");
    return;
  }
  
  const registrobanco = {
    nome,
    email,
    senha
  };

  db.ref('cadastros').push(registrobanco)
    .then(() => {
      alert("Cadastro concluído!");
      document.getElementById('nome').value = '';
      document.getElementById('email').value = '';
      document.getElementById('senha').value = '';
    })
    ;
}