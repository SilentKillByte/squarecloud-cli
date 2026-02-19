const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const FormData = require('form-data');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');
const logs = require('../logs/logs');
const zipPasta = require('./zipPasta');
const { obterTexto } = require('../../utils/idioma');

async function executar(token, caminho) {
    const form = new FormData();
    form.append('file', fs.createReadStream(caminho), {
        filename: path.basename(caminho),
        contentType: 'application/zip'
    });
    const resp = await api.requisicao("POST", "/apps", token, {
        data: form, headers: form.getHeaders()
    });
    return resp.data;
}

async function run(token) {
    console.log(obterTexto('deploy_method_ask'));
    const metodo = await utils.lerTexto(obterTexto('msg_escolha'));
    
    let caminhoFinal = "";

    if (metodo === "2") {
        const pasta = await utils.lerTexto(obterTexto('msg_pasta_deploy'));
        if (!pasta) return;
        
        logs.imprimirTitulo(obterTexto('msg_zipando_pasta'));
        try {
            caminhoFinal = await zipPasta.executar(pasta);
        } catch (err) {
            logs.imprimirErro(`Erro ao zipar: ${err.message}`);
            return;
        }
    } else {
        caminhoFinal = await utils.lerCaminhoZip(obterTexto('msg_arquivo_zip'));
        if (!caminhoFinal) return;
    }

    if (caminhoFinal) {
        const dados = await executar(token, caminhoFinal);
        console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
    }
}

module.exports = { executar, run };
