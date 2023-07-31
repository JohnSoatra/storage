function getHost(url: string) {
    return url.replace(/^(https:\/\/|http:\/\/)/, '').split('/')[0];
}

export default getHost;