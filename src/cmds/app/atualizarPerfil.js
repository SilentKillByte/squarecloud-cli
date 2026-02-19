const api = require('../../servicos/api');
async function executar(token, appId, nome) {
    const resp = await api.requisicao("PUT", `/apps/${appId}`, token, { data: { name: nome } });
    return resp.data;
}
module.exports = { executar };
