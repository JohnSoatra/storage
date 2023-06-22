function getHost(url='') {
    return url.replace(/^(https:\/\/|http:\/\/)/, '').split('/')[0];
}


module.exports = {
    getHost
}