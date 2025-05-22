import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  email: string | null;
  profilePicture: string | null;
  openaiApiKey: string | null;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/login'); // Redirect to login page
    },
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}