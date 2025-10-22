import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Calendar, Youtube, Globe, Bell, ArrowRight } from "lucide-react";

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
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Calendar,
      title: "Schedule",
      description: "Provide countdown and Exam TimeTable",
      link: "/schedule",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Youtube,
      title: "YouTube Links",
      description: "We upload important videos here.",
      link: "#",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      icon: Globe,
      title: "Study Plan",
      description: "Update the schedule and correct study plans here",
      link: "#",
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      icon: Bell,
      title: "Alerts",
      description: "Get notified when exams have only small time to study.",
      link: "/schedule",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-2 tracking-tight">
            Welcome, {user?.displayName || "Student"}!
          </h1>
          <p className="text-lg text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-5 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group border-0 bg-card hover:bg-card/80"
              onClick={() => feature.link !== "#" && navigate(feature.link)}
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>
              {feature.link !== "#" && (
                <div className="flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default StudentDashboard;
