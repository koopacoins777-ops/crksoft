import { z } from "zod";
import { DEFAULT_PET_IMAGE } from "./constants";

export const petIdSchema = z.string().cuid();

export const petFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Name is required" })
      .max(20, { message: "Too long name" }),
    ownerName: z
      .string({ required_error: "ownerName is required" })
      .trim()
      .min(1, { message: "ownerName is required" })
      .max(20, { message: "Too long ownerName" }),
    imageUrl: z.union([
      z.literal(""),
      z.string().trim().url({ message: "Image url must be a valid url" }),
    ]),
    age: z.coerce
      .number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number",
      })
      .positive({ message: "Age must be a positive number" })
      .max(100),
    notes: z.union([
      z.literal(""),
      z.string().trim().max(1000, { message: "Too long notes" }),
    ]),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMAGE,
  }));
// trasform doesn't work for server actions, but does work for traditional handler onSubmit

export type TPetForm = z.infer<typeof petFormSchema>;

export const authSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().max(100),
});

export type TAuth = z.infer<typeof authSchema>;

export const breathingSessionSchema = z.object({
  roundsCompleted: z.number().int().min(1).max(4),
  breathCount: z.number().int().refine((v) => [30, 35, 40].includes(v), {
    message: "breathCount must be 30, 35, or 40",
  }),
  totalRounds: z.number().int().min(2).max(4),
  maxRetentionMs: z.number().int().nonnegative(),
  retentionTimes: z.array(z.number().int().nonnegative()),
});

export type TBreathingSession = z.infer<typeof breathingSessionSchema>;

export const breathingSettingsSchema = z.object({
  breathCount: z.union([z.literal(30), z.literal(35), z.literal(40)]),
  roundCount: z.union([z.literal(2), z.literal(3), z.literal(4)]),
});

export type TBreathingSettings = z.infer<typeof breathingSettingsSchema>;
