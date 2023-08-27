function responseResult<T extends DataResponse>(data: T, message?: ResponseMessage): ResponseResult<T> {
    return {
        data: data,
        ...(message || {})
    }
}

export default responseResult;