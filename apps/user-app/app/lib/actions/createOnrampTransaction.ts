"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export const createOnrampTransaction = async (
  amount: number,
  provider: string
) => {
  const session = await getServerSession(authOptions);
  console.log(session);

  const token = Math.random().toString();

  const userId = session.user.id;
  if (!userId)
    return {
      message: "User is not logged in",
    };

  await prisma.onRampTransaction.create({
    data: {
      userId: Number(userId),
      amount: amount * 100,
      status: "Processing",
      startTime: new Date(),
      provider,
      token,
    },
  });

  return {
    message: "On ramp txns are added",
  };
};

