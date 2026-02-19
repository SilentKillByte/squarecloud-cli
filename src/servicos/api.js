const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = "https://api.squarecloud.app/v2";

function montarHeaders(token, extras = {}) {
    return { "Authorization": token, "Accept": "application/json", ...extras };
}

// handler genérico de req
async function requisicao(method, rota, token, options = {}) {
    const headers = montarHeaders(token, options.headers);
    delete options.headers;
    try {
        return await axios({ method, url: `${API_BASE}${rota}`, headers, timeout: 20000, ...options });
    } catch (error) {
        if (error.response) {
            const msg = error.response.data ? JSON.stringify(error.response.data) : error.response.statusText;
            throw new Error(`Erro API ${error.response.status}: ${msg}`);
        }
        throw error;
    }
}

async function baixarArquivo(url, destino) {
    const dir = path.dirname(destino);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const writer = fs.createWriteStream(destino);
    const response = await axios({ url, method: 'GET', responseType: 'stream', timeout: 30000 });
    
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
module.exports = { requisicao, baixarArquivo };
