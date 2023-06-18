function toObject(array) {
    return array.reduce((a, b) => {
        const keys = Object.keys(b);
        
        for(let key of keys) {
            a[key] = b[key];
        }

        return a;
    }, {});
}

module.exports = toObject;