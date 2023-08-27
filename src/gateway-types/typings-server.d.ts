// Response
type ResponseMessage = {
    status?: number,
    reason?: string,
}

type ResponseResult<T=any> = { data: T } & ResponseMessage;

type DataResponse = null|number|string|boolean|{[key: string]: any};