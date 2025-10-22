import { Home, Calendar, FileText, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calendar, label: "Schedule", path: "/schedule" },
    { icon: FileText, label: "Notes", path: "/notes" },
    { icon: User, label: user ? "Profile" : "Login", path: user ? "/dashboard" : "/auth" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around pb-4 pt-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 transition-all duration-200 py-2 px-3"
            >
              <Icon className={`w-5 h-5 transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
