import VARS from "@/constants/vars";

function userType(type: UserType): number {
    return VARS.USER_TYPE.findIndex(each => each === type);
}

export default userType;