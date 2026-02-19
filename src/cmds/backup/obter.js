const api = require('../../servicos/api');
async function executar(token, appId) {
    const resp = await api.requisicao("GET", `/apps/${appId}/snapshots`, token);
    return resp.data;
}
module.exports = { executar };
