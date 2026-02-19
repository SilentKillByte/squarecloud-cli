const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');
const { obterTexto } = require('../../utils/idioma');

async function executar(token, appId) {
    const resp = await api.requisicao("GET", `/apps/${appId}/logs`, token);
    return resp.data;
}

async function run(token) {
    const appId = await utils.escolherApp();
    const l = await executar(token, appId);
    const logsTexto = l.response?.logs || "";
    if (!logsTexto) return;
    const linhas = logsTexto.split("\n");
    let idx = 0;
    while (idx < linhas.length) {
        utils.limparTela();
        const fim = Math.min(idx + 50, linhas.length);
        for (let i = idx; i < fim; i++) console.log(linhas[i]);
        idx = fim;
        if (idx < linhas.length) {
            const r = await utils.lerTexto(obterTexto('msg_enter_continue'));
            if (r.toLowerCase() === 'q') break;
        }
    }
}

module.exports = { executar, run };
