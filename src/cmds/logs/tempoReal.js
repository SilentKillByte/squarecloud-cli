const http = require('https');
const chalk = require('chalk');
const utils = require('../../utils/utilitarios');
const registro = require('./registro'); 

const API_BASE_HOST = "api.squarecloud.app";

// conecta no sse e printa somente eventos de log
async function executar(token, appId) {
    return new Promise((resolve) => {
        console.log(chalk.cyan(`\nConectando ao stream de logs: ${appId}\n`));

        const options = {
            hostname: API_BASE_HOST,
            path: `/v2/apps/${appId}/realtime`,
            method: 'GET',
            headers: {
                'Authorization': token.trim(),
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'User-Agent': 'SquareCloud-CLI/1.0.0' // sem user agent = 403
            }
        };

        const req = http.request(options, (res) => {
            if (res.statusCode !== 200) {
                const erro = `Erro ao conectar: HTTP ${res.statusCode}`;
                console.log(chalk.red(erro));
                
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    registro.registrarErro("LogsTempoReal", erro, "", {
                        statusCode: res.statusCode,
                        appId,
                        responseBody: body,
                        tokenPrefix: token.substring(0, 10) + "..."
                    });
                    resolve();
                });
                return;
            }

            console.log(chalk.yellow('Stream. Ctrl+C stop.\n'));

            let buffer = '';

            res.on('data', (chunk) => {
                buffer += chunk.toString();
                const partes = buffer.split('\n\n');
                buffer = partes.pop();

                for (const bloco of partes) {
                    _processarBloco(bloco);
                }
            });

            res.on('end', () => {
                console.log(chalk.yellow('\nStream encerrado pelo server.'));
                resolve();
            });

            res.on('error', (err) => {
                console.log(chalk.red(`\nErro no stream: ${err.message}`));
                registro.registrarErro("LogsTempoReal:stream", err.message, err.stack, { appId });
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(chalk.red(`\nFalha na conexão: ${err.message}`));
            registro.registrarErro("LogsTempoReal:request", err.message, err.stack, { appId });
            resolve();
        });

        const encerrar = () => {
            console.log(chalk.yellow('\n\nStream encerrado.'));
            req.destroy();
            resolve();
        };

        process.once('SIGINT', encerrar);

        req.end();
    });
}

function _processarBloco(bloco) {
    const linhas = bloco.split('\n');
    let tipo = '';
    let dado = '';

    for (const linha of linhas) {
        if (linha.startsWith('event:')) tipo = linha.replace('event:', '').trim();
        if (linha.startsWith('data:')) dado = linha.replace('data:', '').trim();
    }

    if (tipo !== 'logs' || !dado) return;

    try {
        const obj = JSON.parse(dado);
        const logs = obj.logs || obj.message || dado;
        const linhasLog = String(logs).split('\n');
        for (const l of linhasLog) {
            if (l.trim()) console.log(chalk.white(l));
        }
    } catch {
        console.log(chalk.white(dado));
    }
}

async function run(token) {
    try {
        const appId = await utils.escolherApp();
        await executar(token, appId);
    } catch (err) {
        console.log(chalk.red(`Erro: ${err.message}`));
        registro.registrarErro("LogsTempoReal:run", err.message, err.stack);
    }
}

module.exports = { executar, run };
