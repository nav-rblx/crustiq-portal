import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { sessionId, jobId } = req.body;

    if (!sessionId || !jobId) {
      return res.status(400).json({
        success: false,
        error: "Missing sessionId or jobId",
      });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        jobId: String(jobId),
      },
    });

    // 🔑 BigInt-safe serialization
    const safeSession = JSON.parse(
      JSON.stringify(updatedSession, (_key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return res.status(200).json({
      success: true,
      session: safeSession,
    });
  } catch (err: any) {
    console.error("Failed to update session jobId:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
