const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');

async function executar(token, appId) {
    const resp = await api.requisicao("POST", `/apps/${appId}/start`, token);
    return resp.data;
}

async function run(token) {
    const appId = await utils.escolherApp();
    const dados = await executar(token, appId);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
