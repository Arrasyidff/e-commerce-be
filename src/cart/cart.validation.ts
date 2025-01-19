import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class CartValidation {
  static readonly ADD_ITEM: ZodType = z.object({
    userId: z.string().min(1),
    productId: z.string().min(1),
    quantity: z.number().positive().min(1),
  });
}