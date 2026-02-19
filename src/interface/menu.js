const chalk = require('chalk');
const fs = require('fs');

const db = require('../db/conta');
const historico = require('../db/historico');
const logs = require('../cmds/logs/logs');
const registro = require('../cmds/logs/registro');
const utils = require('../utils/utilitarios');
const { obterTexto } = require('../utils/idioma');

// sis update
const github = require('../core/github');
const updater = require('../core/updater');

// cmds
const verUsuario = require('../cmds/conta/verUsuario');
const listar = require('../cmds/app/listar');
const statusTodos = require('../cmds/app/statusTodos');
const info = require('../cmds/app/info');
const status = require('../cmds/app/status');
const upload = require('../cmds/deploy/upload');
const commit = require('../cmds/deploy/commit');
const iniciar = require('../cmds/app/iniciar');
const parar = require('../cmds/app/parar');
const reiniciar = require('../cmds/app/reiniciar');
const baixarBackup = require('../cmds/backup/baixar');
const obterLogs = require('../cmds/logs/obter');
const deletar = require('../cmds/app/deletar');
const tempoReal = require('../cmds/logs/tempoReal');
const sair = require('../cmds/conta/sair');

async function checarAtualizacaoInicio() {
    logs.imprimirTitulo(obterTexto('update_check'));
    const release = await github.obterUltimaRelease();
    
    if (release.error) {
        console.log('');
        if (release.error === 'not_found') {
            logs.imprimirErro(obterTexto('update_repo_not_found'));
        } else {
            logs.imprimirErro(obterTexto('update_network_error'));
        }
        await new Promise(r => setTimeout(r, 1000));
        utils.limparTela();
        return;
    }

    const local = updater.obterVersaoLocal();
    
    if (updater.compararVersoes(local, release.tag)) {
        console.log('');
        logs.imprimirAlerta(obterTexto('update_available'));
        logs.imprimirTitulo(`v${local} -> v${release.tag}`);
        
        console.log('\n☞☞☞ Changelog ☜☜☜');
        logs.imprimirMarkdown(release.changelog);
        console.log('-----------------\n');
        
        const aceitar = await utils.lerTexto(obterTexto('update_ask'));
        if (['s', 'y', 'sim', 'yes'].includes(aceitar.toLowerCase())) {
            logs.imprimirTitulo(obterTexto('update_downloading'));
            const sucesso = await updater.baixarEInstalar(release.url_zip);
            
            if (sucesso) {
                logs.imprimirTitulo(obterTexto('update_success'));
                updater.reiniciarAplicacao();
            } else {
                logs.imprimirErro(obterTexto('update_error'));
            }
        } else {
            console.log("Update skip.");
        }
    } else {
        logs.imprimirTitulo(obterTexto('update_uptodate'));
    }
    await new Promise(r => setTimeout(r, 1000));
    utils.limparTela();
}

async function obterToken() {
    let conta = db.lerConta();
    let token = conta.token || "";
    if (!token) {
        logs.imprimirAlerta(obterTexto('msg_token_missing'));
        token = await utils.lerTexto(obterTexto('msg_token_ask'));
        db.salvarConta({ token });
        registro.registrarAuditoria("token_cadastrado", {});
    }
    return token;
}

function mostrarMenu() {
    const versao = updater.obterVersaoLocal();
    console.log(utils.lerBanner());
    console.log(`Square Cloud CLI v${versao}`);
    console.log(`GitHub: https://github.com/SilentKillByte/squarecloud-cli\n`);
    
    const opcoes = obterTexto('menu_opcoes');
    for (const [chave, val] of Object.entries(opcoes)) {
        console.log(`[${chave}] ${val}`);
    }
}


async function executarMenu() {
    await checarAtualizacaoInicio();
    
    const token = await obterToken();
    
    while (true) {
        try {
            utils.limparTela();
            mostrarMenu();
            const escolha = await utils.lerTexto(obterTexto('msg_escolha'));
            
            if (escolha === "0") {
                console.log(obterTexto('msg_saindo'));
                break;
            }
            
            switch(escolha) {
                case "1": await require('../cmds/conta/verUsuario').run(token); break;
                case "2": await require('../cmds/app/listar').run(token); break;
                case "3": await require('../cmds/app/statusTodos').run(token); break;
                case "4": await require('../cmds/app/info').run(token); break;
                case "5": await require('../cmds/app/status').run(token); break;
                case "6": await require('../cmds/deploy/upload').run(token); break;
                case "7": await require('../cmds/deploy/commit').run(token); break;
                case "8": await require('../cmds/app/iniciar').run(token); break;
                case "9": await require('../cmds/app/parar').run(token); break;
                case "10": await require('../cmds/app/reiniciar').run(token); break;
                case "11": await require('../cmds/backup/baixar').run(token); break;
                case "12": await require('../cmds/logs/obter').run(token); break;
                case "13": await require('../cmds/app/deletar').run(token); break;
                case "14": await require('../cmds/deploy/gerarConfig').run(); break;
                case "15": await require('../cmds/conta/configuracoes').run(); break;
                case "16": await require('../cmds/logs/tempoReal').run(token); break;
                case "17": await require('../cmds/deploy/historicoCmds').run(token); break;
                case "18": await require('../cmds/conta/sair').run(); break;
                default: logs.imprimirAlerta("Inválido/Invalid");
            }
        } catch (err) {
            logs.imprimirErro(err.message);
            registro.registrarErro("Menu", err.message);
        }
        await utils.lerTexto(obterTexto('msg_enter_continue'));
    }
}
module.exports = { executarMenu };
