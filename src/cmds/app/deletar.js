const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');
const { obterTexto } = require('../../utils/idioma');
const baixarBackup = require('../backup/baixar');

async function executar(token, appId) {
    const resp = await api.requisicao("DELETE", `/apps/${appId}`, token);
    return resp.data;
}

async function run(token) {
    const appId = await utils.escolherApp();
    await baixarBackup.executar(token, appId);
    if (await utils.confirmar(obterTexto('msg_confirmar_exclusao'))) {
        const dados = await executar(token, appId);
        console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
    }
}

module.exports = { executar, run };
