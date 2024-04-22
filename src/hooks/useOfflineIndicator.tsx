import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { onlineManager } from "@tanstack/react-query";

export function useOfflineIndicator() {
  const { toast } = useToast();

  useEffect(() => {
    return onlineManager.subscribe(() => {
      if (onlineManager.isOnline()) {
        toast({
          title: "online",
          duration: 2000,
        });
      } else {
        toast({
          title: "offline",
          duration: Infinity,
        });
      }
    });
  }, [toast]);
}
