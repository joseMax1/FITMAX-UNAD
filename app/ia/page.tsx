import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/session";
import IAClient from "./IAClient";

export default async function IAPage() {
  const user = await usuarioActual();
  const messages = await prisma.chatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return (
    <AppShell user={user} flex>
      <IAClient initialMessages={messages.map((m) => ({ role: m.role, content: m.content }))} />
    </AppShell>
  );
}
