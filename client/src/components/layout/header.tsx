import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              {user?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.username}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
