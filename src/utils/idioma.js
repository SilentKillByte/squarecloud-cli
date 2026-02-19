const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'config.json');

function carregarConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
        return { idioma: 'en' };
    }
}

function obterTexto(chave) {
    const cfg = carregarConfig();
    // try carregar o idioma selecionado, se dar ruim vai pro en <3
    let traducoes = {};
    try {
        const langPath = path.join(__dirname, '..', 'language', `${cfg.idioma}.json`);
        traducoes = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    } catch {
        const fallbackPath = path.join(__dirname, '..', 'language', 'en.json');
        try { traducoes = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8')); } catch { return chave; }
    }

    return chave.split('.').reduce((o, i) => (o ? o[i] : chave), traducoes);
}

module.exports = { obterTexto, carregarConfig };
