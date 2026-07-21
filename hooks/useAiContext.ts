// hooks/useAiContext.ts
import { useConfiguration } from "@/app/(protected)/providers/ConfigurationProvider";

export function useAiContext() {
  const { config, isLoading, error } = useConfiguration();
  
  // If config is not loaded, return a default/empty context
  if (isLoading || error || !config) {
    return {
      context: "Loading school configuration...",
      isReady: false
    };
  }

    // 🚀 FIX: Cast to 'any' to bypass strict ViewModel type mismatch
  const cfg = config as any;
  const schoolInfo = `School: ${cfg.school?.name || 'N/A'} | Board: ${cfg.school?.boardName || 'N/A'}`;
  const classes = cfg.academic?.levels?.join(", ") || "N/A";
  
  // Note: Since ViewModel doesn't have all nested details, we create a lightweight context here.
  // For heavy AI tasks, the backend will use the full buildAiContext() function.
  const context = `[SYSTEM CONTEXT] The user belongs to "${config.school?.name}" (${config.school?.type}), following the ${config.school?.boardName} curriculum. Offered Levels: ${classes}.`;
  
  return {
    context,
    isReady: true
  };
}
