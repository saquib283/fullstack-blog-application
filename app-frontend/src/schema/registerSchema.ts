import { z } from "zod";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be 100 characters or fewer")
    .regex(/^[a-zA-Z\s.'-]+$/, "Full name contains invalid characters"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be 30 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscores, periods, and hyphens"
    ),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(100, "Email must be 100 characters or fewer")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be in a valid format (example: user@example.com)"
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be 128 characters or fewer")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  profilePicture: z
    .custom<File>((val) => val instanceof File && val.size > 0, {
      message: "Profile picture is required",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      {
        message: "Profile picture must be a JPEG, PNG, or WEBP file",
      }
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Profile picture must be less than 2MB",
    }),
});

export default registerSchema;
