const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');

async function executar(token, appId) {
    const resp = await api.requisicao("GET", `/apps/${appId}/status`, token);
    const apps = resp.data.response || {};
    return Array.isArray(apps) ? apps : [apps];
}

async function run(token) {
    const appId = await utils.escolherApp();
    const dados = await executar(token, appId);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
