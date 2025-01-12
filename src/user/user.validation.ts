import { Injectable } from "@nestjs/common";
import { z, ZodType } from "zod";

@Injectable()
export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(1).max(100),
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(255),
    role: z.string().min(1).max(20).optional(),
  });
}