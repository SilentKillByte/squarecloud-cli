const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// lê o .squareignore e retorna lista pra ignorar
function _lerSquareignore(pastaRaiz) {
    const ignorePath = path.join(pastaRaiz, '.squareignore');
    if (!fs.existsSync(ignorePath)) return [];
    return fs.readFileSync(ignorePath, 'utf-8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'));
}

function _deveIgnorar(relativo, padroes) {
    for (const padrao of padroes) {
        if (relativo === padrao) return true;
        if (relativo.startsWith(padrao + path.sep)) return true;
        if (relativo.startsWith(padrao + '/')) return true;
    }
    return false;
}

function _adicionarRecursivo(zip, pastaRaiz, pastaAtual, padroes) {
    const itens = fs.readdirSync(pastaAtual);
    for (const item of itens) {
        const absoluto = path.join(pastaAtual, item);
        const relativo = path.relative(pastaRaiz, absoluto);

        if (_deveIgnorar(relativo, padroes)) continue;

        const stat = fs.statSync(absoluto);
        if (stat.isDirectory()) {
            _adicionarRecursivo(zip, pastaRaiz, absoluto, padroes);
        } else {
            // mantem a estrutura de pastas dentro do zip
            const zipFolder = path.dirname(relativo);
            zip.addLocalFile(absoluto, zipFolder === '.' ? '' : zipFolder);
        }
    }
}



async function executar(caminhoPasta) {
    if (!fs.existsSync(caminhoPasta) || !fs.statSync(caminhoPasta).isDirectory()) {
        throw new Error(`Pasta não encontrada: ${caminhoPasta}`);
    }

    const padroes = _lerSquareignore(caminhoPasta);
    const zip = new AdmZip();

    _adicionarRecursivo(zip, caminhoPasta, caminhoPasta, padroes);

    const nomePasta = path.basename(caminhoPasta);
    const destino = path.join(require('os').tmpdir(), `${nomePasta}-${Date.now()}.zip`);
    zip.writeZip(destino);

    return destino;
}

module.exports = { executar };
