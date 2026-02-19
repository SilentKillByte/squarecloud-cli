const axios = require('axios');

// hardcoded :)
const REPO_OWNER = "SilentKillByte";
const REPO_NAME = "squarecloud-cli";

async function obterUltimaRelease() {
    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.status === 200) {
            return {
                tag: response.data.tag_name.replace('v', ''),
                url_zip: response.data.zipball_url || response.data.tarball_url,
                changelog: response.data.body
            };
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { error: 'not_found' };
        }
        return { error: 'network' };
    }
    return { error: 'network' };
}

module.exports = { obterUltimaRelease };
