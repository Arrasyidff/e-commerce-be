import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class CategoryValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100)
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100).optional().nullable()
  });
}