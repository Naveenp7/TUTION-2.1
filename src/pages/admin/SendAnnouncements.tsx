import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";
import { getAnnouncements, createAnnouncement } from "@/lib/db";

export default function SendAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    message: ""
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const announcements = await getAnnouncements();
      setAnnouncements(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to fetch announcements");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    try {
      await createAnnouncement({
        title: formData.title,
        message: formData.message,
        sent_by: user.uid
      });
      
      toast.success("Announcement sent successfully!");
      setFormData({ title: "", message: "" });
      fetchAnnouncements();
      
      // TODO: Call edge function to send emails to all users
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast.error("Failed to send announcement");
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Send Announcements</h1>
        
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Announcement</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>
            
            <div>
              <Label>Message</Label>
              <Textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your announcement message here..."
                rows={6}
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send to All Students
            </Button>
          </form>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Previous Announcements</h2>
        
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-4">
              <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
              <p className="text-sm mb-2">{announcement.message}</p>
              <p className="text-xs text-muted-foreground">
                Sent on {format(new Date(announcement.created_at), "PPP 'at' p")}
              </p>
            </Card>
          ))}
          
          {announcements.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No announcements sent yet.
              </p>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
