import AvancePage from "@/pages/AvancePage";
import MallaPage from "@/pages/MallaPage";
import LandingPage from "@/pages/LandingPage";
import { parseRoute, useRoute } from "@/lib/router";

export default function App() {
  const route = useRoute();
  const { page, careerId } = parseRoute(route);

  if (page === "avance") return <AvancePage careerId={careerId} />;
  if (page === "malla") return <MallaPage careerId={careerId} />;

  return <LandingPage />;
}
