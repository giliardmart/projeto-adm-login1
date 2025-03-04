const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dados temporários (em produção, use um banco de dados como MongoDB)
let users = [];
const adminPassword = "senhaadm"; // Senha do ADM (altere conforme necessário)

// Rota para servir arquivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para o ADM cadastrar um novo email
app.post('/cadastrar-email', (req, res) => {
    const { email, adminPass } = req.body;

    // Verificar se a senha do ADM está correta
    if (adminPass !== adminPassword) {
        return res.status(401).json({ message: 'Senha de ADM incorreta!' });
    }

    // Verificar se o email já existe
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'Email já cadastrado!' });
    }

    // Salvar o email sem senha (usuário ainda não definiu a senha)
    users.push({ email, password: null });
    res.status(200).json({ message: 'Email cadastrado com sucesso!' });
});

// Rota para verificar se o email existe e permitir definir senha
app.post('/verificar-email', (req, res) => {
    const { email } = req.body;

    // Verificar se o email existe
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ message: 'Email não encontrado!' });
    }

    // Verificar se o usuário já definiu uma senha
    if (user.password) {
        return res.status(400).json({ message: 'Senha já definida para este email!' });
    }

    res.status(200).json({ message: 'Email verificado com sucesso!' });
});

// Rota para o usuário definir sua senha
app.post('/definir-senha', (req, res) => {
    const { email, password } = req.body;

    // Encontrar o usuário pelo email
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(404).json({ message: 'Email não encontrado!' });
    }

    // Definir a senha do usuário
    user.password = password;
    res.status(200).json({ message: 'Senha definida com sucesso!' });
});

// Rota para verificar login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verificar credenciais
    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Email ou senha incorretos!' });
    }

    res.status(200).json({ message: 'Login bem-sucedido!' });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});