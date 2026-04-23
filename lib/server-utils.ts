import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { Pet, User } from "@prisma/client";
import prisma from "./db";

export async function checkAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}

export async function getPetById(petId: Pet["id"]) {
  const pet = prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  return pet;
}

export async function getPetsByUserId(userId: User["id"]) {
  const pets = prisma.pet.findMany({
    where: {
      userId,
    },
  });

  return pets;
}

export async function getBreathingData(userId: User["id"]) {
  const [sessions, settings] = await Promise.all([
    prisma.breathingSession.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    }),
    prisma.breathingSettings.findUnique({ where: { userId } }),
  ]);
  return { sessions, settings };
}
