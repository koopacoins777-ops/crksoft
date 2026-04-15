"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { checkAuth } from "@/lib/server-utils";
import { breathingSessionSchema, breathingSettingsSchema } from "@/lib/validations";

export async function saveBreathingSession(data: unknown) {
  const session = await checkAuth();

  const validated = breathingSessionSchema.safeParse(data);
  if (!validated.success) {
    return { message: "Invalid session data" };
  }

  try {
    await prisma.breathingSession.create({
      data: {
        ...validated.data,
        userId: session.user.id,
      },
    });
  } catch {
    return { message: "Could not save session" };
  }

  revalidatePath("/app/breathing", "layout");
}

export async function updateBreathingSettings(data: unknown) {
  const session = await checkAuth();

  const validated = breathingSettingsSchema.safeParse(data);
  if (!validated.success) {
    return { message: "Invalid settings data" };
  }

  try {
    await prisma.breathingSettings.upsert({
      where: { userId: session.user.id },
      update: validated.data,
      create: {
        ...validated.data,
        userId: session.user.id,
      },
    });
  } catch {
    return { message: "Could not save settings" };
  }

  revalidatePath("/app/breathing", "layout");
}
