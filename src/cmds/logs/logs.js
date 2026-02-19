const chalk = require('chalk');

function imprimirTitulo(texto) { console.log(chalk.cyan(texto)); }
function imprimirAlerta(texto) { console.log(chalk.yellow(texto)); }
function imprimirErro(texto) { console.log(chalk.red(texto)); }
function imprimirMarkdown(texto) { console.log(chalk.white(texto)); }

module.exports = { imprimirTitulo, imprimirAlerta, imprimirErro, imprimirMarkdown };
