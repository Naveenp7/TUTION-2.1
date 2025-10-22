import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Bell, Moon, Sun } from "lucide-react";
import { format } from "date-fns";
import { getAnnouncements } from "@/lib/db";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";

interface NavbarProps {
  user?: any;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export const Navbar = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }

    const fetchAnnouncements = async () => {
      try {
        const fetchedAnnouncements = await getAnnouncements();
        setAnnouncements(fetchedAnnouncements as Announcement[]);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        toast.error("Failed to load announcements");
      }
    };

    fetchAnnouncements();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to logout");
    }
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <span className="text-lg md:text-xl font-semibold">Tuition</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Home
              </Link>
              <Link to="/schedule" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Schedule
              </Link>
              <Link to="/notes" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Notes
              </Link>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {announcements.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="text-sm font-semibold">Announcements</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-72 w-full rounded-md">
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => (
                        <DropdownMenuItem
                          key={announcement.id}
                          className="flex flex-col items-start space-y-1 cursor-pointer px-3 py-2"
                          onClick={() => handleAnnouncementClick(announcement)}
                        >
                          <p className="text-sm font-medium leading-none">{announcement.title}</p>
                          <p className="text-xs leading-snug text-muted-foreground">{announcement.message}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(announcement.created_at), "PPP 'at' p")}</p>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem className="text-center text-muted-foreground text-sm">
                        No new announcements
                      </DropdownMenuItem>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  variant="default"
                  size="sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAnnouncement && (
        <AlertDialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedAnnouncement.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedAnnouncement.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <p className="text-xs text-muted-foreground mr-auto">
                Sent on {format(new Date(selectedAnnouncement.created_at), "PPP 'at' p")}
              </p>
              <AlertDialogAction onClick={() => setIsDetailModalOpen(false)}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </nav>
  );
};
