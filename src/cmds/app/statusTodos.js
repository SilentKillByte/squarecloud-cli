const chalk = require('chalk');
const api = require('../../servicos/api');

async function executar(token) {
    const resp = await api.requisicao("GET", "/apps/status", token);
    const apps = resp.data.response || [];
    return Array.isArray(apps) ? apps : [apps];
}

async function run(token) {
    const dados = await executar(token);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
