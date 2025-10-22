import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, FileText, Download, Mail, BookOpen, Calendar, Bell, Layers, ArrowRight } from "lucide-react";
import { getStats } from "@/lib/db";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalDownloads: 0,
    emailsSent: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await getStats();
      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats.totalUsers,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: FileText,
      label: "Total Notes",
      value: stats.totalNotes,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Download,
      label: "Total Downloads",
      value: stats.totalDownloads,
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      icon: Mail,
      label: "Emails Sent",
      value: stats.emailsSent,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const managementCards = [
    {
      icon: BookOpen,
      title: "Manage Notes",
      description: "Add, edit, or delete course notes and materials",
      link: "/admin/notes",
    },
    {
      icon: Calendar,
      title: "Manage Timetable",
      description: "Create and update exam schedules",
      link: "/admin/timetable",
    },
    {
      icon: Bell,
      title: "Send Announcements",
      description: "Email all registered students",
      link: "/admin/announcements",
    },
    {
      icon: Layers,
      title: "Manage Semesters",
      description: "Add or edit semester information",
      link: "/admin/semesters",
    },
  ];

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your college tuition platform</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4 sm:p-6 border-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3 sm:mb-4`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-semibold">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
          {managementCards.map((card, index) => (
            <Link key={index} to={card.link}>
              <Card className="p-5 md:p-6 hover:shadow-md transition-all duration-200 cursor-pointer group border-0 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
