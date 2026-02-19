import { useRouteLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { getSessionUser } from "~/lib/auth.server";
import BoardGamesList from "~/components/BoardGamesList";
import TTRPGList from "~/components/TTRPGList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const meta: MetaFunction = () => [
  { title: "Games - FrenCon 2026" },
  {
    name: "description",
    content: "Board games and TTRPGs to play at FrenCon. Add games and vote.",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser(request);
  if (!user) {
    throw redirect(
      `/signin?redirect=${encodeURIComponent(new URL(request.url).pathname)}`
    );
  }
  return { user };
}

export default function Games() {
  const data = useRouteLoaderData<{ user: Awaited<ReturnType<typeof getSessionUser>> }>("root");
  const user = data?.user ?? null;

  return (
    <div className="space-y-3 px-2 py-3 md:space-y-6 md:px-4 md:py-6 h-full overflow-hidden">
      <Tabs defaultValue="board-games" className="grid grid-cols-1 grid-rows-[auto_1fr] gap-0 h-full w-full overflow-hidden">
        <TabsList>
          <TabsTrigger value="board-games">Board Games</TabsTrigger>
          <TabsTrigger value="ttrpg">TTRPG</TabsTrigger>
        </TabsList>
        <TabsContent value="board-games" className="h-full overflow-hidden">
          <BoardGamesList user={user} />
        </TabsContent>
        <TabsContent value="ttrpg" className="h-full overflow-hidden">
          <TTRPGList user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
