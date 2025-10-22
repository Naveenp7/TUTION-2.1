import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Chat } from "@/components/Chat";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getNotes, getSemesters, updateNoteDownloads } from "@/lib/db";
import { Note, Semester } from '@/lib/db';

const Notes = () => {
  const { semester } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (semester && semester !== selectedSemester) {
      setSelectedSemester(semester);
    }
    fetchNotes();
  }, [semester, selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Sign in for Customized Semester wise Notes");
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getNotes(selectedSemester === "all" ? undefined : selectedSemester);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (noteId: string, driveLink: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      try {
        await updateNoteDownloads(noteId, note.downloads || 0);
        window.open(driveLink, "_blank");
        fetchNotes();
      } catch (error) {
        console.error("Error updating downloads:", error);
        toast.error("Failed to update download count");
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3 tracking-tight">
            {selectedSemester === "all" ? "Study Notes" : semesters.find(s => s.id === selectedSemester)?.name}
          </h1>
          <p className="text-lg text-muted-foreground">Access all course materials and study resources</p>
        </div>

        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={selectedSemester}
          onValueChange={setSelectedSemester}
        >
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 mb-8 bg-transparent">
            <TabsTrigger value="all" className="rounded-lg border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary/50">
              All Notes
            </TabsTrigger>
            {semesters.map((semester) => (
              <TabsTrigger 
                key={semester.id} 
                value={semester.id} 
                className="rounded-lg border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-secondary/50"
              >
                {semester.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedSemester}>
            {loading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-base">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground">No notes available</p>
                <p className="text-base text-muted-foreground mt-2">Check back later for updates</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {(selectedSemester === "all" ? notes : notes.filter(note => note.semester_id === selectedSemester)).map((note) => (
                  <Card key={note.id} className="p-5 md:p-6 hover:shadow-md transition-all duration-200 border-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{note.subject_name}</h3>
                      </div>
                    </div>
                    
                    {note.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{note.description}</p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mb-4 font-medium">{note.downloads || 0} downloads</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-sm h-9"
                        onClick={() => window.open(note.drive_link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 text-sm h-9"
                        onClick={() => handleDownload(note.id, note.drive_link)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Chat subjectName={selectedSemester === "all" ? "General" : semesters.find(s => s.id === selectedSemester)?.name || "General"} />
      <BottomNav />
    </div>
  );
};

export default Notes;
