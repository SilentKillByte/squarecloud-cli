const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');
const BASE_DIR = path.join(__dirname, '..', '..', 'data', 'backups');

function _gerarDestino(appId, contexto) {
    const safeApp = (appId.toLowerCase() === "all") ? "todas-aplicacoes" : appId;
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const destinoDir = path.join(BASE_DIR, contexto, safeApp);
    if (!fs.existsSync(destinoDir)) fs.mkdirSync(destinoDir, { recursive: true });
    return path.join(destinoDir, `${safeApp}-${timestamp}.zip`);
}

async function executar(token, appId, contexto = "apps") {
    const resp = await api.requisicao("POST", `/apps/${appId}/snapshots`, token);
    const result = { status: resp.data.status, contexto };
    const url = resp.data.response?.url;
    
    if (!url) return result;
    
    const destino = _gerarDestino(appId, contexto);
    await api.baixarArquivo(url, destino);
    
    result.backup_path = destino;
    result.url = url;
    return result;
}

async function run(token) {
    const appId = await utils.escolherApp(false);
    const dados = await executar(token, appId);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
