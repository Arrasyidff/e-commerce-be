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

  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(1).max(100).email(),
    password: z.string().min(1).max(255),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1),
    username: z.string().min(1).max(100).optional().nullable(),
    email: z.string().min(1).max(100).email().optional().nullable(),
    password: z.string().min(1).max(255).optional().nullable(),
    role: z.string().min(1).max(20).optional().nullable(),
  });
}