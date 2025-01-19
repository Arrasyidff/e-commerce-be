import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class OrderValidation {
  static readonly CREATE: ZodType = z.object({
    payment_method: z.string().min(1),
  });

  static readonly FILTER: ZodType = z.object({
    status: z.string().min(1).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1),
    status: z.string().min(1),
  });
}