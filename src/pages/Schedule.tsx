import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { Calendar, Clock, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getExamSchedules, getSemesters, Semester } from "@/lib/db";

interface ExamSchedule {
  id?: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  semester_id?: string;
  semester_name?: string;
}

const Schedule = () => {
  const [user] = useAuthState(auth);
  const [schedule, setSchedule] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchSchedule(selectedSemester);
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Sign in for Customized Semester wise Schedule");
    }
  };

  const fetchSchedule = async (semesterId?: string) => {
    setLoading(true);
    try {
      const data = await getExamSchedules(semesterId === "all" ? undefined : semesterId);
      setSchedule(data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedNotifPref = localStorage.getItem("notificationsEnabled");
    setNotificationsEnabled(savedNotifPref === "true");
  }, []);

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem("notificationsEnabled", String(newState));
    toast.success(
      newState 
        ? "Email notifications enabled" 
        : "Email notifications disabled"
    );
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Exam Schedule</h1>
          <p className="text-muted-foreground text-sm md:text-base">View your exam timetable and get reminders</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Select onValueChange={setSelectedSemester} value={selectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {user && (
          <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <Bell className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1 text-sm md:text-base">Email Notifications</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Get notified 1 day and 1 hour before each exam
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleNotifications}
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
                className="w-full sm:w-auto"
              >
                {notificationsEnabled ? "Enabled" : "Enable"}
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm md:text-base">Loading schedule...</p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-base md:text-lg text-muted-foreground">No exam schedule available yet</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {schedule.map((exam) => (
              <Card key={exam.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-2">{exam.subject}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(exam.exam_date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        {exam.exam_time}
                      </span>
                    </div>
                    {exam.semester_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {exam.semester_name}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Schedule;
