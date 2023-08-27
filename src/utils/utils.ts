function isNullUndefined(value: any) {
    return (
        value === null ||
        value === undefined
    );
}

function isUndefined(value: any) {
    return value === undefined;
}

function stringEmpty(value: string) {
    return value === '';
}

export {
    isNullUndefined,
    stringEmpty,
    isUndefined
}