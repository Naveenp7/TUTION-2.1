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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex items-center justify-center pb-6 pt-4">
        <div className="bg-black rounded-full px-4 py-3 flex items-center gap-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="transition-all"
              >
                {active ? (
                  <div className="bg-black text-white rounded-full px-6 py-2 flex items-center gap-2 border-2 border-white">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ) : (
                  <div className="bg-gray-300 text-gray-600 rounded-full p-3 flex items-center justify-center hover:bg-gray-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
