import { Request } from "express";

export default function matched(req: Request) {
  return {
    ...req.query,
    ...req.body,
    ...req.params
  }
}
