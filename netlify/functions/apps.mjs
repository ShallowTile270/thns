import { json, listApps, publicView } from "./_lib.mjs";

export default async () => {
  const apps = (await listApps("approved")).map(publicView);
  return json({ apps });
};
