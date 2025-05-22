import type { pageWithLayout } from "@/layoutTypes";
import { loginState, workspacestate } from "@/state";
import Workspace from "@/layouts/workspace";
import { useState, useMemo } from "react";
import prisma from "@/utils/database";
import { useRecoilState } from "recoil";
import axios from "axios";
import Button from "@/components/button";
import StarterKit from '@tiptap/starter-kit'
import { withPermissionCheckSsr } from "@/utils/permissionsManager";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { generateHTML } from '@tiptap/html'
import { IconArrowLeft, IconTrash, IconClock, IconUser, IconEdit } from "@tabler/icons";
import clsx from 'clsx';

type Props = {
    document: any;
}

export const getServerSideProps: GetServerSideProps = withPermissionCheckSsr(async (context) => {
    const { gid } = context.query;
    if (!gid) return { notFound: true };
    const user = await prisma.user.findUnique({
        where: {
            userid: BigInt(context.req.session.userid)
        },
        include: {
            roles: {
                where: {
                    workspaceGroupId: parseInt(context.query.id as string)
                }
            }
        }
    });
    const guide = await prisma.document.findUnique({
        where: {
            id: (gid as string),
        },
        include: {
            owner: {
                select: {
                    username: true,
                    picture: true,
                }
            },
            roles: true
        }
    }).catch(() => null);
    if (!guide) return { notFound: true };
    if (!guide.roles.find(role => role.id === user?.roles[0].id) && !user?.roles[0].isOwnerRole && !user?.roles[0].permissions.includes('manage_docs')) return { notFound: true };

    return {
        props: {
            document: JSON.parse(JSON.stringify(guide, (key, value) => (typeof value === 'bigint' ? value.toString() : value))),
        },
    }
})

const Settings: pageWithLayout<Props> = ({ document }) => {
    const [login, setLogin] = useRecoilState(loginState);
    const [workspace, setWorkspace] = useRecoilState(workspacestate);
    const router = useRouter();
    const [wallMessage, setWallMessage] = useState("");
    const friendlyDate = `${new Date(document.createdAt).toLocaleDateString()} at ${new Date(document.createdAt).toLocaleTimeString()}`;

    const output = useMemo(() => {
        return generateHTML((document.content as Object), [
            StarterKit
        ])
    }, [document.content]);

    const deleteDoc = async () => {
        await axios.post(`/api/workspace/${workspace.groupId}/guides/${document.id}/delete`, {}, {});
        router.push(`/workspace/${workspace.groupId}/docs`);
    }

    const goback = () => {
        window.history.back();
    }

    return (
        <div className="pagePadding">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={goback}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <IconArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            {document.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <IconUser className="w-4 h-4" />
                            <span>Created by {document.owner.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IconClock className="w-4 h-4" />
                            <span>Last updated {friendlyDate}</span>
                        </div>
                    </div>
                </div>

                {/* Google Doc Embed */}
                {document.googleDocUrl && (
                    <div className="mb-8">
{document.googleDocUrl && (
  <div className="mb-8 w-full overflow-auto flex justify-center">
    <div
      className="google-doc-embed"
      style={{
        width: 900, // A4 width in px
        maxWidth: "100%",
      }}
    >
      <iframe
        src={document.googleDocUrl}
        title="Google Doc"
        width="900"
        height="600"
        className="border rounded no-scrollbar"
        allowFullScreen
        style={{
          border: "none",
          width: "100%",
          height: 600,
          display: "block",
          background: "white",
        }}
      />
    </div>
    <style jsx>{`
      .google-doc-embed {
        transition: transform 0.2s;
      }
      @media (max-width: 950px) {
        .google-doc-embed {
          transform: scale(calc(100vw / 900));
          transform-origin: top left;
          width: 900px;
        }
      }
      @media (max-width: 600px) {
        .google-doc-embed {
          transform: scale(calc(100vw / 900));
          transform-origin: top left;
          width: 900px;
        }
      }
    `}</style>
  </div>
)}
                    </div>
                )}

                {/* Document Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                    <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: output }} 
                    />
                </div>

                {/* Actions */}
                {workspace.yourPermission.includes('manage_docs') && (
                    <div className="mt-6 flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/workspace/${workspace.groupId}/docs/${document.id}/edit`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <IconEdit className="w-4 h-4" />
                            Edit Document
                        </button>
                        <button
                            onClick={deleteDoc}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <IconTrash className="w-4 h-4" />
                            Delete Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

Settings.layout = Workspace;

export default Settings;