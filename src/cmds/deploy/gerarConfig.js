const fs = require('fs');
const utils = require('../../utils/utilitarios');
const logs = require('../logs/logs');
const { obterTexto } = require('../../utils/idioma');

async function run() {
    console.log("\nGerador squarecloud.app\n");
    const main = await utils.lerTexto("MAIN: ");
    const memory = await utils.lerTexto("MEMORY: ");
    const version = await utils.lerTexto("VERSION (recommended): ") || "recommended";
    const display = await utils.lerTexto("DISPLAY_NAME: ");
    // em breve
    
    const content = `MAIN=${main}\nMEMORY=${memory}\nVERSION=${version}\nDISPLAY_NAME=${display}\n`;
    
    console.log("\n--- squarecloud.app ---");
    logs.imprimirMarkdown(content);
    console.log("-----------------------");
    console.log(obterTexto('msg_copie_cole'));

    if (await utils.confirmar(obterTexto('msg_salvar_arquivo'))) {
        fs.writeFileSync("squarecloud.app", content);
        console.log(obterTexto('msg_arquivo_criado'));
    }
}

module.exports = { run };
