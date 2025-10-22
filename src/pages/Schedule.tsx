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
      
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">Exam Schedule</h1>
          <p className="text-lg text-muted-foreground">View your exam timetable and manage reminders</p>
        </div>

        <div className="mb-6">
          <Select onValueChange={setSelectedSemester} value={selectedSemester}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
          <Card className="p-5 md:p-6 mb-8 border-0 bg-blue-50 dark:bg-blue-950/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">Exam Reminders</h3>
                  <p className="text-sm text-muted-foreground">
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
          <div className="text-center py-16">
            <p className="text-muted-foreground text-base">Loading schedule...</p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-lg font-medium text-foreground">No exam schedule available</p>
            <p className="text-base text-muted-foreground mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {schedule.map((exam) => (
              <Card key={exam.id} className="p-5 md:p-6 hover:shadow-md transition-all duration-200 border-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-3">{exam.subject}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {new Date(exam.exam_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="hidden sm:block text-muted-foreground/40">•</span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        {exam.exam_time}
                      </span>
                    </div>
                    {exam.semester_name && (
                      <p className="text-xs text-muted-foreground mt-3 font-medium">
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
