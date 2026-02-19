const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const FormData = require('form-data');
const api = require('../../servicos/api');
const utils = require('../../utils/utilitarios');
const logs = require('../logs/logs'); 
const historico = require('../../db/historico');
const baixarBackup = require('../backup/baixar');
const zipPasta = require('./zipPasta');
const { obterTexto } = require('../../utils/idioma');

async function executar(token, appId, caminho) {
    const form = new FormData();
    form.append('file', fs.createReadStream(caminho), {
        filename: path.basename(caminho),
        contentType: 'application/zip'
    });
    const resp = await api.requisicao("POST", `/apps/${appId}/commit`, token, {
        data: form, headers: form.getHeaders()
    });
    return resp.data;
}

// faz commit a partir de um zip resolved
// backup pre commit - commit - registro no historico
async function executarComHistorico(token, appId, caminhoZip, fonte) {
    logs.imprimirTitulo(obterTexto('msg_backup_pre_commit'));
    const bk = await baixarBackup.executar(token, appId, "backup_pre_commit");

    bk.backup_path
        ? logs.imprimirTitulo(`${obterTexto('msg_backup_sucesso')} ${bk.backup_path}`)
        : logs.imprimirAlerta(obterTexto('msg_backup_falha'));

    const resultado = await executar(token, appId, caminhoZip);
    const sucesso = resultado.status === "success";

    // registra no historico independente de ter dado certo ou nao
    historico.registrarCommit(appId, {
        arquivo: caminhoZip,
        fonte,
        resultado: sucesso ? "sucesso" : "falha",
        backup_path: bk.backup_path || null
    });

    return resultado;
}

async function run(token) {
    const appId = await utils.escolherApp();
    
    console.log(obterTexto('deploy_method_ask'));
    const metodo = await utils.lerTexto(obterTexto('msg_escolha'));
    
    let caminhoFinal = "";
    let fonte = "zip";

    if (metodo === "2") {
        const pasta = await utils.lerTexto(obterTexto('msg_pasta_deploy'));
        if (!pasta) return;
        
        logs.imprimirTitulo(obterTexto('msg_zipando_pasta'));
        try {
            caminhoFinal = await zipPasta.executar(pasta);
            fonte = "pasta";
        } catch (err) {
            logs.imprimirErro(`Erro ao zipar: ${err.message}`);
            return;
        }
    } else {
        // Zip (default)
        caminhoFinal = await utils.lerCaminhoZip(obterTexto('msg_arquivo_zip'));
        if (!caminhoFinal) return;
    }

    if (caminhoFinal) {
        const dados = await executarComHistorico(token, appId, caminhoFinal, fonte);
        console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
    }
}

module.exports = { executar, executarComHistorico, run };
