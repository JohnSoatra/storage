import express from "express";

declare global {
  namespace Express {
    interface Request {
      requestPath?: RequestPath
    }
  }
}