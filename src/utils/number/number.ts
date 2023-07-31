import { isNullUndefined, stringEmpty } from "@/utils/utils";

function isNumber(str: string) {
    return !(isNullUndefined(str) || stringEmpty(str) || isNaN(+str));
}

export {
    isNumber
};