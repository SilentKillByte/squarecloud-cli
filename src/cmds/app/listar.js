const chalk = require('chalk');
const api = require('../../servicos/api');

async function executar(token) {
    const resp = await api.requisicao("GET", "/users/me", token);
    const apps = resp.data.response?.applications || [];
    return Array.isArray(apps) ? apps : [apps];
}

async function run(token) {
    const dados = await executar(token);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
