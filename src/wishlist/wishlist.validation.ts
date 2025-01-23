import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class WishlistValidation {
  static readonly ADD_ITEM: ZodType = z.object({
    productId: z.string().min(1),
  });
}