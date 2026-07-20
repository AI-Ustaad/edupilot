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

  // Generate the AI Context dynamically on the client
  const schoolInfo = `School: ${config.schoolName} | Board: ${config.boardName}`;
  const classes = config.levels.join(", ");
  
  // Note: Since ViewModel doesn't have all nested details, we create a lightweight context here.
  // For heavy AI tasks, the backend will use the full buildAiContext() function.
  const context = `[SYSTEM CONTEXT] The user belongs to "${config.schoolName}" (${config.schoolType}), following the ${config.boardName} curriculum. Offered Levels: ${classes}.`;
  
  return {
    context,
    isReady: true
  };
}
