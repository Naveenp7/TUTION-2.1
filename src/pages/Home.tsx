import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileText, Calendar, Youtube, Globe, Bell } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Chat } from "@/components/Chat";
import { Card } from "@/components/ui/card";
import { getAnnouncements } from "@/lib/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const announcements = await getAnnouncements();
        if (announcements && announcements.length > 0) {
          const latest = announcements[0] as Announcement;
          const lastSeenAnnouncementId = localStorage.getItem("lastSeenAnnouncementId");

          if (latest.id !== lastSeenAnnouncementId) {
            setLatestAnnouncement(latest);
            setIsAnnouncementOpen(true);
            localStorage.setItem("lastSeenAnnouncementId", latest.id);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  const features = [
    {
      icon: FileText,
      title: "PDF Notes",
      description: "All subjects notes available here.",
      link: "/notes",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "Provide countdown and Exam TimeTable",
      link: "/schedule",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Youtube,
      title: "Important Youtube Links",
      description: "We upload important videos here.",
      link: "#",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: Globe,
      title: "Study Plan",
      description: "Update the schedule and correct studyplans here",
      link: "#",
      gradient: "from-teal-500 to-teal-600",
    },
    {
      icon: Bell,
      title: "Trigger alert",
      description: "Get notified when exam have only small time to study.",
      link: "/schedule",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to Tuition
          </h1>
          <p className="text-muted-foreground text-sm">Your academic companion</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 md:p-8 hover:shadow-lg transition-all cursor-pointer group bg-card border-border"
              onClick={() => feature.link !== "#" && navigate(feature.link)}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <Chat isGeneral={true} />
      <BottomNav />

      {latestAnnouncement && (
        <AlertDialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{latestAnnouncement.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {latestAnnouncement.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsAnnouncementOpen(false)}>
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Home;
