import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamSchedule, Semester, getExamSchedules, getSemesters, createExamSchedule, updateExamSchedule, deleteExamSchedule } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import { format } from "date-fns";

export default function ManageTimetable() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ExamSchedule | null>(null);
  
  const [formData, setFormData] = useState({
    subject: "",
    exam_date: "",
    exam_time: "",
    semester_id: "none"
  });

  useEffect(() => {
    fetchSchedules();
    fetchSemesters();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await getExamSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules");
    }
  };

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Failed to fetch semesters");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        await updateExamSchedule(editingSchedule.id, formData);
        toast.success("Schedule updated successfully");
      } else {
        await createExamSchedule(formData);
        toast.success("Schedule added successfully");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(editingSchedule ? "Failed to update schedule" : "Failed to add schedule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      await deleteExamSchedule(id);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      exam_date: "",
      exam_time: "",
      semester_id: "none"
    });
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormData({
      subject: schedule.subject,
      exam_date: schedule.exam_date,
      exam_time: schedule.exam_time,
      semester_id: schedule.semester_id || "none"
    });
    setIsDialogOpen(true);
  };

  const sendReminders = async () => {
    toast.info("Email reminders feature requires email service setup");
    // This will be implemented with edge functions
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Timetable</h1>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={sendReminders}>
              <Bell className="w-4 h-4 mr-2" />
              Send Reminders
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Semester (Optional)</Label>
                    <Select
                      value={formData.semester_id}
                      onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {semesters.map((sem) => (
                          <SelectItem key={sem.id} value={sem.id}>
                            {sem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Subject</Label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  
                  <div>
                    <Label>Exam Date</Label>
                    <Input
                      required
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>Exam Time</Label>
                    <Input
                      required
                      type="time"
                      value={formData.exam_time}
                      onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingSchedule ? "Update" : "Add"} Schedule
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{schedule.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(schedule.exam_date), "PPP")} at {schedule.exam_time}
                  </p>
                  {schedule.semester_id && semesters.find(s => s.id === schedule.semester_id) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {semesters.find(s => s.id === schedule.semester_id)?.name}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(schedule)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(schedule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {schedules.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No schedules found. Add your first exam schedule!
              </p>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
