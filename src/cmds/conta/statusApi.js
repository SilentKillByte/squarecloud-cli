const chalk = require('chalk');
const api = require('../../servicos/api');

async function executar(token) {
    const [user, apps] = await Promise.all([
        api.requisicao("GET", "/users/me", token),
        api.requisicao("GET", "/apps/status", token)
    ]);
    return { user: user.data, apps: apps.data };
}

async function run(token) {
    const dados = await executar(token);
    console.log(chalk.cyan(JSON.stringify(dados, null, 2)));
}

module.exports = { executar, run };
