const fs = require('fs');
const path = require('path');

const HISTORICO_DIR = path.join(__dirname, '..', 'data', 'historico');

function _garantirDir() {
    if (!fs.existsSync(HISTORICO_DIR)) fs.mkdirSync(HISTORICO_DIR, { recursive: true });
}

function _caminhoArquivo(appId) {
    return path.join(HISTORICO_DIR, `${appId}.json`);
}

function lerHistorico(appId) {
    _garantirDir();
    const p = _caminhoArquivo(appId);
    if (!fs.existsSync(p)) return [];
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
    catch { return []; }
}

// add um registro ao historico do app 
function registrarCommit(appId, entrada) {
    _garantirDir();
    const historico = lerHistorico(appId);
    historico.unshift({
        timestamp: new Date().toISOString(),
        ...entrada
    });
    fs.writeFileSync(_caminhoArquivo(appId), JSON.stringify(historico, null, 2), 'utf-8');
}

// retorna o commit mais recente com backup_path 
function obterUltimoComBackup(appId) {
    const historico = lerHistorico(appId);
    return historico.find(r => r.backup_path && fs.existsSync(r.backup_path)) || null;
}

module.exports = { lerHistorico, registrarCommit, obterUltimoComBackup };
