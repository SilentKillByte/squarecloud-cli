const fs = require('fs');
const path = require('path');
const DATA_PATH = path.resolve(__dirname, '..', 'data', 'conta.json');

function lerConta() {
    if (!fs.existsSync(DATA_PATH)) return { token: "" };
    try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8')); } 
    catch { return { token: "" }; }
}

function salvarConta(dados) {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(dados, null, 2), 'utf-8');
}
module.exports = { lerConta, salvarConta };
