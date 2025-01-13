import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(100),
    price: z.string().min(1),
    stock: z.number().min(0),
    categoryId: z.string()
  });
}