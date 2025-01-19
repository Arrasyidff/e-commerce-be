import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class OrderValidation {
  static readonly CREATE: ZodType = z.object({
    payment_method: z.string().min(1),
  });
}