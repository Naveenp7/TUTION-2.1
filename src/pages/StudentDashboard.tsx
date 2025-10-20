import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, Globe, Bell } from "lucide-react";

const StudentDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const features = [
    {
      icon: FileText,
      title: "PDF Notes",
      description: "All subjects notes available here.",
      link: "/notes",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "Provide countdown and Exam TimeTable",
      link: "/schedule",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Globe,
      title: "Important Youtube Links",
      description: "We upload important videos here.",
      link: "#",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
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
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome, {user?.displayName || "Student"}!
          </h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 md:p-8 hover:shadow-lg transition-all cursor-pointer group"
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
      
      <BottomNav />
    </div>
  );
};

export default StudentDashboard;
