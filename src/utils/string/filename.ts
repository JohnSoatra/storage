const reNo = /^(.*-[0-9]+)$/;

function newFilename(filename: string) {
    const dotIndex = filename.lastIndexOf('.');
    const rawName = dotIndex > -1 ? filename.slice(0, dotIndex) : filename;
    const ext = dotIndex > -1 ? filename.slice(dotIndex + 1) : '';

    if (reNo.test(rawName)) {
        const minusIndex = rawName.lastIndexOf('-');
        const no = rawName.slice(minusIndex + 1);

        return `${rawName.slice(0, minusIndex)}-${+no + 1}${ext && ('.' + ext)}`;
    }

    return `${rawName}-1${ext && ('.' + ext)}`
}

export default newFilename;