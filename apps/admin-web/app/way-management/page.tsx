
import { Shell, SectionTitle } from "../_components/ui";
import WayManagementConsole from "./WayManagementConsole";

export default function WayManagementPage() {
  return (
    <Shell activeHref="/way-management">
      <WayManagementConsole />
    </Shell>
  );
}
