import { createClient } from "@/app/utils/supabase/server";
export default async function Models() {
  const supabase = await createClient();
  const { data: models } = await supabase.from("models").select();
  return <pre>{JSON.stringify(models, null, 2)}</pre>;
}
