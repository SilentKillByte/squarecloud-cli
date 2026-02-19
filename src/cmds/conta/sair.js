const db = require('../../db/conta');
const utils = require('../../utils/utilitarios');
const { obterTexto } = require('../../utils/idioma');

async function run() {
    if (await utils.confirmar(obterTexto('msg_confirmar_logout'))) {
        db.salvarConta({});
        console.log(obterTexto('msg_logout_success'));
        process.exit(0);
    }
}

module.exports = { run };
