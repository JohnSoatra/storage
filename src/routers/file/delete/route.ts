import VARS from "@/constants/vars";
import { oneRouter } from "@/utils/router/create";
import responseResult from "@/utils/response/create";
import path from "path";
import fs from 'fs';
import { isUndefined } from "@/utils/utils";
import getOneUser from "@/utils/fetch/getone_user";
import userType from "@/utils/user/user_type";

const deleteFileRouter = oneRouter<DeleteFileRouter>('post',
    async (request) => {
        const {data: user, status} = await getOneUser(request);

        if (user) {
            if (user.type === userType('admin')) {
                const body = request.body;
                const name = body['name'];
                const hasAll = !isUndefined(name);
        
                if (hasAll) {
                    const delete_path = path.join(VARS.STORAGE_PATH, name);
            
                    if (fs.existsSync(delete_path) && fs.lstatSync(delete_path).isFile()) {
                        fs.unlinkSync(delete_path);
            
                        return responseResult(true);
                    }
                }
            }

            return responseResult(false, { status: 400 });
        }

        return responseResult(false, { status: status });

    }
);

export default deleteFileRouter;