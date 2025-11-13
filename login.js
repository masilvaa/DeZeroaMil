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
      let usuarioencontrado = null;

      if (usuarios) {
        Object.entries(usuarios).forEach(([id, usuario]) => {
          if (usuario.email === email && usuario.senha === senha) {
            usuarioencontrado = { id, nome: usuario.nome, email: usuario.email };
          }
        });
      }

      if (usuarioencontrado) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioencontrado));
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
