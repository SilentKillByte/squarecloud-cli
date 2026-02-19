const chalk = require('chalk');
const utils = require('../../utils/utilitarios');
const logs = require('../logs/logs');
const historico = require('../../db/historico');
const { obterTexto } = require('../../utils/idioma');

async function run(token) {
    const appId = await utils.escolherApp();
    const hist = historico.lerHistorico(appId);
    if (!hist.length) {
        logs.imprimirAlerta(obterTexto('msg_historico_vazio'));
    } else {
        console.log(chalk.cyan(JSON.stringify(hist, null, 2)));
    }
}

module.exports = { run };
