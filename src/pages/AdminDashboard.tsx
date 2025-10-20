import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, FileText, Download, Mail, BookOpen, Calendar, Bell, Layers } from "lucide-react";
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
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: FileText,
      label: "Total Notes",
      value: stats.totalNotes,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Download,
      label: "Total Downloads",
      value: stats.totalDownloads,
      gradient: "from-teal-500 to-teal-600",
    },
    {
      icon: Mail,
      label: "Emails Sent",
      value: stats.emailsSent,
      gradient: "from-orange-500 to-orange-600",
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
      
      <main className="container mx-auto px-4 py-6 sm:py-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your college tuition platform</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-4 sm:p-6">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 sm:mb-4`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {managementCards.map((card, index) => (
            <Link key={index} to={card.link}>
              <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer">
                <card.icon className="w-8 h-8 mb-3 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{card.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
