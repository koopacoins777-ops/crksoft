import BreathingContextProvider from "@/contexts/BreathingContextProvider";
import { checkAuth, getBreathingData } from "@/lib/server-utils";

export default async function BreathingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkAuth();
  const data = await getBreathingData(session.user.id);

  return (
    <BreathingContextProvider data={data}>{children}</BreathingContextProvider>
  );
}
