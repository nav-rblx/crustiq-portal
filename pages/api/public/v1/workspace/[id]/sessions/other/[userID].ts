import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/database";
import { validateApiKey } from "@/utils/api-auth";

/**
 * Status resolver (same logic style you already use)
 */
function getSessionStatus(session: any) {
  const now = new Date();
  const statues = session.sessionType.statues || [];
  let status = "scheduled";

  const sortedStatues = [...statues].sort(
    (a: any, b: any) => a.timeAfter - b.timeAfter
  );

  for (const s of sortedStatues) {
    const activateTime = new Date(session.date);
    activateTime.setMinutes(activateTime.getMinutes() + s.timeAfter);

    if (now >= activateTime) {
      status = s.name.toLowerCase().replace(/ /g, "-");
    } else {
      break;
    }
  }

  if (session.ended) return "completed";
  if (session.startedAt && status !== "started") return "started";
  if (now > new Date(session.date) && status === "scheduled") return "missed";

  return status;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  if (!apiKey) {
    return res
      .status(401)
      .json({ success: false, error: "Missing API key" });
  }

  const workspaceId = Number(req.query.id);
  const userID = Number(req.query.userID);

  if (!workspaceId || !userID) {
    return res.status(400).json({
      success: false,
      error: "Missing workspace ID or userID",
    });
  }

  try {
    const key = await validateApiKey(apiKey, workspaceId.toString());
    if (!key) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid API key" });
    }

    /**
     * Today range: 12:00 AM → 11:59:59 PM (server local time)
     */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await prisma.session.findMany({
      where: {
        ownerId: BigInt(userID),
        sessionType: {
          workspaceGroupId: workspaceId,
        },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        owner: {
          select: {
            userid: true,
            username: true,
            picture: true,
          },
        },
        sessionType: {
          select: {
            id: true,
            name: true,
            description: true,
            gameId: true,
            slots: true,
            statues: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                userid: true,
                username: true,
                picture: true,
              },
            },
          },
        },
        logs: true,
        notes: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      name: session.name,
      date: session.date,
      startedAt: session.startedAt,
      ended: session.ended,
      duration: session.duration,
      jobId: session.jobId,
      type: {
        id: session.sessionType.id,
        name: session.sessionType.name,
        description: session.sessionType.description,
        category: session.type,
        gameId: session.sessionType.gameId
          ? Number(session.sessionType.gameId)
          : null,
        slots: session.sessionType.slots,
      },
      host: session.owner
        ? {
            userId: Number(session.owner.userid),
            username: session.owner.username,
            thumbnail: session.owner.picture,
          }
        : null,
      participants: session.users.map((u) => ({
        userId: Number(u.user.userid),
        username: u.user.username,
        thumbnail: u.user.picture,
        slot: u.slot,
        role: u.roleID,
      })),
      logs: session.logs,
      notes: session.notes,
      status: getSessionStatus(session),
    }));

    return res.status(200).json({
      success: true,
      dateRange: {
        start: startOfDay,
        end: endOfDay,
      },
      total: formattedSessions.length,
      sessions: JSON.parse(
        JSON.stringify(formattedSessions, (_k, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      ),
    });
  } catch (err) {
    console.error("Error fetching hosted sessions:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
