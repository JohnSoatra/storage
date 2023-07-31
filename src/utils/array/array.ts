function toObject(array: {[key: string]: string}[]): {[key: string]: string} {
    return array.reduce((a, b) => {
        const keys = Object.keys(b);
            
        for(let key of keys) {
            a[key] = b[key];
        }

        return a;
    }, {});
}

export default toObject;