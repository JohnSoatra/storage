function trim(obj) {
    const newObj = {}

    for (let key of Object.keys(obj)) {
        if (typeof(obj[key]) === "string") {
            newObj[key] = obj[key].trimEnd();
        } else {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}

module.exports = trim;