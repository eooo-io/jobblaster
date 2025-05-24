import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Sun, Moon } from "lucide-react";
import appIcon from "@assets/app-icon-jobblaster.png";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { apiRequest } from "@/lib/queryClient";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged into JobBlaster.",
      });
      onLoginSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Your JobBlaster account has been created successfully.",
      });
      setIsLogin(true);
      setFormData({ username: "", password: "", email: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password
      });
    } else {
      registerMutation.mutate({
        username: formData.username,
        password: formData.password,
        email: formData.email
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-gray-700/50"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-40 h-40 sm:w-100 sm:h-100 mx-auto mb-4">
            <img 
              src={appIcon} 
              alt="JobBlaster" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <p className="text-slate-600 dark:text-gray-300">Personal Intelligent Resume & Job Match Engine</p>
        </div>

        {/* Login/Register Form */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-xl">
          <CardContent className="p-6 ml-[0px] mr-[0px] pl-[10px] pr-[10px] pt-[10px] pb-[10px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Create one" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-gray-400">
          <p>Secure personal workspace for resume optimization</p>
        </div>
      </div>
    </div>
  );
}