import { useRouter } from "@/utils/router/create";
import postTestRouter from "./post/route";
import getTestRouter from "./get/route";

let testRouter = useRouter({
    '/post': postTestRouter,
    '/get': getTestRouter
});

export default testRouter;