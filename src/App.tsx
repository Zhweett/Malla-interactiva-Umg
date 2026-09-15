import AvancePage from "@/pages/AvancePage";
import MallaPage from "@/pages/MallaPage";
import { useRoute } from "@/lib/router";

export default function App() {
  const route = useRoute();

  // Cualquier ruta desconocida cae en la malla.
  return route === "/avance" ? <AvancePage /> : <MallaPage />;
}
