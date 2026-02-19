const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'log');
const ERROS_PATH = path.join(LOG_DIR, 'erros.txt');
const AUDITORIA_PATH = path.join(LOG_DIR, 'auditoria.txt');

function _garantirDiretorios() { if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true }); }

function registrarAuditoria(acao, detalhes = {}) {
    _garantirDiretorios();
    const registro = { timestamp: new Date().toISOString(), acao, detalhes };
    fs.appendFileSync(AUDITORIA_PATH, JSON.stringify(registro) + "\n", 'utf-8');
}

function registrarErro(contexto, mensagem, stack = "", extras = {}) {
    _garantirDiretorios();
    const registro = { timestamp: new Date().toISOString(), contexto, mensagem, stack, extras };
    fs.appendFileSync(ERROS_PATH, JSON.stringify(registro) + "\n", 'utf-8');
}
module.exports = { registrarAuditoria, registrarErro };
