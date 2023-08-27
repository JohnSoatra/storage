async function getJson(response: Response) {
    const contentType = response.headers.get('content-type');

    if (contentType === null) {
        return null;
    } else if (contentType.indexOf('application/json') === 0) {
        return await response.json();
    }

    return await response.text();
}

export default getJson;