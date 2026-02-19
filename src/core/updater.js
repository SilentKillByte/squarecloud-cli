const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');
const logs = require('../cmds/logs/logs');

const VERSION_FILE = path.join(__dirname, '..', 'config', 'version.json');
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// o update nao vai apagar/sobrescrever 
const PRESERVAR = [
    'src/data', 
    'src/config/config.json', 
    'src/log', 
    'node_modules'
];

function obterVersaoLocal() {
    try {
        const data = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
        return data.version;
    } catch {
        return "0.0.0";
    }
}

function compararVersoes(local, remota) {
    const v1 = local.split('.').map(Number);
    const v2 = remota.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        const a = v1[i] || 0;
        const b = v2[i] || 0;
        if (a > b) return false;
        if (a < b) return true;
    }
    return false;
}


async function baixarEInstalar(url) {
    const tempDir = path.join(ROOT_DIR, 'temp_update');
    const zipPath = path.join(tempDir, 'update.zip');

    try { // limpa antigos 
        await fs.emptyDir(tempDir);

        // baixa o arquivo zip da release
        const writer = fs.createWriteStream(zipPath);
        const response = await axios({ url, method: 'GET', responseType: 'stream' });
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // extrai o zip
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempDir, true);

        // O git cria uma pasta com hash dentro zip ent precisa achar
        const items = fs.readdirSync(tempDir);
        let sourceDir = tempDir;
        
        const innerFolder = items.find(i => fs.statSync(path.join(tempDir, i)).isDirectory() && i !== 'src');
        if (innerFolder) sourceDir = path.join(tempDir, innerFolder);

        const filterFunc = (src, dest) => {
            const rel = path.relative(sourceDir, src);
            if (PRESERVAR.some(p => rel.startsWith(p) || rel === p)) {
                return false; 
            }
            return true;
        };

        // copia tudo novo 
        await fs.copy(sourceDir, ROOT_DIR, { filter: filterFunc, overwrite: true });

        await fs.remove(tempDir);

        return true;

    } catch (e) {
        logs.imprimirErro(e.message);
        return false;
    }
}

function reiniciarAplicacao() {
    setTimeout(() => { // so pra nao bugar o restart 
        const subprocess = spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'ignore',
            cwd: process.cwd() 
        });
        subprocess.unref();
        process.exit();
    }, 100);
}

module.exports = { 
    obterVersaoLocal, 
    compararVersoes, 
    baixarEInstalar, 
    reiniciarAplicacao 
};
