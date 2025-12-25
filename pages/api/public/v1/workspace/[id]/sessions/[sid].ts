import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/database";
import { validateApiKey } from "@/utils/api-auth";

function getSessionStatus(session: any) {
  const now = new Date();

  const statues = session.sessionType.statues || [];
  let status = "scheduled";

  // Sort statues by timeAfter ascending
  const sortedStatues = [...statues].sort((a: any, b: any) => a.timeAfter - b.timeAfter);

  for (const s of sortedStatues) {
    const activateTime = new Date(session.date);
    activateTime.setMinutes(activateTime.getMinutes() + s.timeAfter);

    if (now >= activateTime) {
      status = s.name.toLowerCase().replace(/ /g, "-");
    } else {
      break; // Stop when the next statue hasn't been reached yet
    }
  }

  // Override if session ended or startedAt
  if (session.ended) return "completed";
  if (session.startedAt && status !== "started") return "started";

  // If the session date is in the past and no status applied
  if (now > new Date(session.date) && status === "scheduled") status = "missed";

  return status;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = req.headers.authorization?.replace("Bearer ", "");
  if (!apiKey)
    return res.status(401).json({ success: false, error: "Missing API key" });

  const workspaceId = Number.parseInt(req.query.id as string);
  const sessionId = req.query.sid as string;

  if (!workspaceId)
    return res
      .status(400)
      .json({ success: false, error: "Missing workspace ID" });
  if (!sessionId)
    return res
      .status(400)
      .json({ success: false, error: "Missing session ID" });

  try {
    const key = await validateApiKey(apiKey, workspaceId.toString());
    if (!key) {
      return res.status(401).json({ success: false, error: "Invalid API key" });
    }
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        sessionType: {
          workspaceGroupId: workspaceId,
        },
      },
      include: {
        sessionType: true,
      },
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    }

    if (req.method === "GET") {
      const sessionWithDetails = await prisma.session.findUnique({
        where: { id: sessionId },
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
        },
      });

      const formattedSession = {
        id: sessionWithDetails!.id,
        date: sessionWithDetails!.date,
        startedAt: sessionWithDetails!.startedAt,
        ended: sessionWithDetails!.ended,
        type: {
          id: sessionWithDetails!.sessionType.id,
          name: sessionWithDetails!.sessionType.name,
          gameId: sessionWithDetails!.sessionType.gameId
            ? Number(sessionWithDetails!.sessionType.gameId)
            : null,
          slots: sessionWithDetails!.sessionType.slots,
        },
        host: sessionWithDetails!.owner
          ? {
              userId: Number(sessionWithDetails!.owner.userid),
              username: sessionWithDetails!.owner.username,
              thumbnail: sessionWithDetails!.owner.picture,
            }
          : null,
        participants: sessionWithDetails!.users.map((user) => ({
          userId: Number(user.user.userid),
          username: user.user.username,
          thumbnail: user.user.picture,
          slot: user.slot,
          role: user.roleID,
        })),
        status: getSessionStatus(sessionWithDetails!), // <-- fixed
      };

      return res.status(200).json({
        success: true,
        session: formattedSession,
      });
    } else if (req.method === "PUT") {
      const { date, hostUserId, participants } = req.body;

      if (!date && hostUserId === undefined && !participants) {
        return res
          .status(400)
          .json({ success: false, error: "No update data provided" });
      }

      const updateData: any = {};

      if (date) {
        updateData.date = new Date(date);
      }

      if (hostUserId !== undefined) {
        if (hostUserId === null) {
          updateData.ownerId = null;
        } else {
          const workspaceMember = await prisma.workspaceMember.findFirst({
            where: {
              workspaceGroupId: workspaceId,
              userId: BigInt(hostUserId),
            },
          });

          if (!workspaceMember) {
            return res
              .status(400)
              .json({ success: false, error: "Host not found in workspace" });
          }

          updateData.ownerId = BigInt(hostUserId);
        }
      }

      await prisma.session.update({
        where: { id: sessionId },
        data: updateData,
      });

      if (participants && Array.isArray(participants)) {
        await prisma.sessionUser.deleteMany({
          where: { sessionid: sessionId },
        });

        for (const participant of participants) {
          const { userId, roleId, slot } = participant;

          if (!userId || !roleId || slot === undefined) {
            continue;
          }

          const workspaceMember = await prisma.workspaceMember.findFirst({
            where: {
              workspaceGroupId: workspaceId,
              userId: BigInt(userId),
            },
          });

          if (!workspaceMember) {
            continue;
          }

          await prisma.sessionUser.create({
            data: {
              userid: BigInt(userId),
              sessionid: sessionId,
              roleID: roleId,
              slot: parseInt(slot),
            },
          });
        }
      }

      const updatedSession = await prisma.session.findUnique({
        where: { id: sessionId },
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
        },
      });

      const formattedSession = {
        id: updatedSession!.id,
        date: updatedSession!.date,
        startedAt: updatedSession!.startedAt,
        ended: updatedSession!.ended,
        type: {
          id: updatedSession!.sessionType.id,
          name: updatedSession!.sessionType.name,
          gameId: updatedSession!.sessionType.gameId
            ? Number(updatedSession!.sessionType.gameId)
            : null,
          slots: updatedSession!.sessionType.slots,
        },
        host: updatedSession!.owner
          ? {
              userId: Number(updatedSession!.owner.userid),
              username: updatedSession!.owner.username,
              thumbnail: updatedSession!.owner.picture,
            }
          : null,
        participants: updatedSession!.users.map((user) => ({
          userId: Number(user.user.userid),
          username: user.user.username,
          thumbnail: user.user.picture,
          slot: user.slot,
          role: user.roleID,
        })),
        status: getSessionStatus(updatedSession!), // <-- fixed
      };

      return res.status(200).json({
        success: true,
        session: formattedSession,
      });
    } else if (req.method === "DELETE") {
      await prisma.sessionUser.deleteMany({
        where: { sessionid: sessionId },
      });

      await prisma.session.delete({
        where: { id: sessionId },
      });

      return res.status(200).json({
        success: true,
        message: "Session deleted successfully",
      });
    } else {
      return res
        .status(405)
        .json({ success: false, error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in public API:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
}
