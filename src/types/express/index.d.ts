import express from "express";

declare global {
  namespace Express {
    interface Request {
      requestPath?: RequestPath,
    }

    interface Response {
      return: <T extends DataResponse>(data: T, message?: ResponseMessage) => void
    }
  }
}