import AvancePage from "@/pages/AvancePage";
import MallaPage from "@/pages/MallaPage";
import LandingPage from "@/pages/LandingPage";
import { useRoute } from "@/lib/router";

export default function App() {
  const route = useRoute();

  if (route === "/avance") return <AvancePage />;
  if (route === "/malla") return <MallaPage />;

  // Ruta raíz: landing page. Cualquier otra ruta desconocida cae en la malla.
  return route === "/" ? <LandingPage /> : <MallaPage />;
}
