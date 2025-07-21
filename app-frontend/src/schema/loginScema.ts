import { z } from "zod";

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .max(150, "Username or email must be 150 characters or fewer")
    .regex(
      /^[\w.@+-]+$/,
      "Username or email contains invalid characters"
    ),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be 128 characters or fewer")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default loginSchema;
