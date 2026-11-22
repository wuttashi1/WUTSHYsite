import { YoutubeSettings } from "@/components/admin/YoutubeSettings";
import { isSiteAdmin } from "@/lib/visualizer/server";
import { redirect } from "next/navigation";
export default async function Page() {
  if (!await isSiteAdmin()) redirect("/admin/login");
  return <YoutubeSettings />;
}
