"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type SaveResumeTextUrlInput = {
  resumeUrl: string;
  extractedText: string;
};

export async function saveResumeTextUrl({ resumeUrl, extractedText }: SaveResumeTextUrlInput) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  await db.user.update({
    where: { id: user.id },
    data: { resumeUrl, extractedText },
  });

  // Revalidate the resume-analysis page cache
  revalidatePath("/resume-analysis");
}

export async function getResumeTextUrl() {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { resumeUrl: true, extractedText: true },
  });

  return {
    resumeUrl: record?.resumeUrl || null,
    extractedText: record?.extractedText || null,
  };
}
