// server.js
require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json()); 

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'relatorios'))); 

const analiseRoutes = require('./src/routes/analise'); 
app.use('/api', analiseRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/index.html`);
});