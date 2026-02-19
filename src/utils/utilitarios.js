const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { obterTexto } = require('./idioma');

const BANNER_PATH = path.join(__dirname, '..', 'interface', 'banner.txt');

function limparTela() {
    // apaga o buffer de scroll
    process.stdout.write('\x1Bc');
}

function lerTexto(pergunta) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(pergunta, (res) => {
            rl.close();
            resolve(res.trim());
        });
    });
}

async function lerCaminhoZip(promptMsg) {
    const caminho = await lerTexto(promptMsg);
    if (fs.existsSync(caminho) && fs.lstatSync(caminho).isFile()) return caminho;
    return "";
}

function lerBanner() {
    if (!fs.existsSync(BANNER_PATH)) return "";
    return fs.readFileSync(BANNER_PATH, 'utf-8');
}

async function escolherApp(permitirAll = false) {
    const extra = permitirAll ? " (ou 'all')" : "";
    const texto = obterTexto('msg_app_id');
    const valor = await lerTexto(`${texto}${extra}: `);
    if (permitirAll && valor.toLowerCase() === "all") return "all";
    return valor;
}

async function confirmar(mensagem) {
    const sufixo = obterTexto('term_yn'); // sufixo do idioma atual buscar
    const r = (await lerTexto(`${mensagem} ${sufixo}: `)).toLowerCase();    
    return ['s', 'sim', 'y', 'yes'].includes(r);
}

module.exports = { limparTela, lerTexto, lerCaminhoZip, lerBanner, escolherApp, confirmar };
