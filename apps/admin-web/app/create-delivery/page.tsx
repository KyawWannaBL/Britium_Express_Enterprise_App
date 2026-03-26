
import { getCreateDeliveryData } from "../../lib/data";
import { CreateDeliveryConsole } from "./CreateDeliveryConsole";

export default async function CreateDeliveryPage() {
  const live = await getCreateDeliveryData();
  return <CreateDeliveryConsole initialData={live} />;
}
