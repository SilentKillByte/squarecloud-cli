const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');

async function executar(token) {
    const resp = await api.requisicao("GET", "/users/me", token);
    return resp.data.response?.user || {};
}

async function run(token) {
    const dados = await executar(token);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
