import { LoginView } from "@/presentation/auth/LoginView";

// Vista de inicio en "/". Sin sidebar (está fuera del grupo de rutas (app)).
export default function LoginPage() {
  return <LoginView />;
}
