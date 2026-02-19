const fs = require('fs');
const path = require('path');
const utils = require('../../utils/utilitarios');
const { obterTexto, carregarConfig } = require('../../utils/idioma');

async function run() {
    while (true) {
        utils.limparTela();
        console.log(obterTexto('settings_title') + "\n");
        console.log(`[1] ${obterTexto('settings_opt_lang')}`);
        console.log(`[0] ${obterTexto('settings_back')}`);
        
        const opt = await utils.lerTexto(obterTexto('msg_escolha'));
        
        if (opt === '0') break;
        if (opt === '1') await menuIdioma();
    }
}

async function menuIdioma() {
    utils.limparTela();
    const langDir = path.join(__dirname, '..', '..', 'language');
    const arquivos = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    
    console.log(obterTexto('settings_select_lang') + "\n");
    
    arquivos.forEach((file, index) => {
        const nome = file.replace('.json', '');
        console.log(`[${index + 1}] ${nome.toUpperCase()}`);
    });
    
    console.log(`[0] ${obterTexto('settings_back')}`);
    
    const escolha = await utils.lerTexto(obterTexto('msg_escolha'));
    const idx = parseInt(escolha) - 1;

    if (idx >= 0 && idx < arquivos.length) {
        const novoIdioma = arquivos[idx].replace('.json', '');
        const cfg = carregarConfig();
        cfg.idioma = novoIdioma;
        
        fs.writeFileSync(
            path.join(__dirname, '..', '..', 'config', 'config.json'), 
            JSON.stringify(cfg, null, 2)
        );
        // console.log("Idioma alterado / Language changed!");
        await utils.lerTexto("Enter...");
    }
}

module.exports = { run };
