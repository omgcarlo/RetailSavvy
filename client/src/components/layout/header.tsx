import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies } from "@/lib/currency";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="ml-auto flex items-center gap-4">
        <Select
          value={currency}
          onValueChange={(value: "USD" | "PHP") => setCurrency(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currencies).map(([code, curr]) => (
              <SelectItem key={code} value={code}>
                {curr.symbol} {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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