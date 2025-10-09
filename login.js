function logarconta() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert("Preencha todos os campos para fazer o login.");
    return;
  }

  db.ref('cadastros').once('value')
    .then(snapshot => {
      const usuarios = snapshot.val();

      let encontrado = false;

      if (usuarios) {
        Object.values(usuarios).forEach(usuario => {
          if (usuario.email === email && usuario.senha === senha) {
            encontrado = true;
            sessionStorage.setItem('usuarioLogado', usuario.nome);
          }
        });
      }

      if (encontrado) {
        alert("Login bem-sucedido!");
        window.location.href = "home.html";  
      } else {
        alert("Email ou senha incorretos.");
      }
    })
    .catch(error => {
      console.error("Erro ao acessar o banco:", error);
      alert("Erro ao fazer login. Tente novamente.");
    });
}
