import { ServicesProvider } from "@/presentation/di/ServicesProvider";
import { LoginView } from "@/presentation/auth/LoginView";

// Vista de inicio en "/". Necesita ServicesProvider para el ViewModel de login.
export default function LoginPage() {
  return (
    <ServicesProvider>
      <LoginView />
    </ServicesProvider>
  );
}
