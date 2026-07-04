// hooks/useTelemetry.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useTelemetry = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["telemetry"],
    queryFn: async () => safeObject(await apiClient.get("/super-admin/telemetry")),
    enabled: user?.role === "super_admin", // صرف سپر ایڈمن کیلئے چلے گا
  });
};
