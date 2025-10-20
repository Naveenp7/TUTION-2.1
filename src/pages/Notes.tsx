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
      
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {selectedSemester === "all" ? "All Notes" : semesters.find(s => s.id === selectedSemester)?.name}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Access all course materials and resources</p>
        </div>

        <Tabs 
          defaultValue="all" 
          className="w-full"
          value={selectedSemester}
          onValueChange={setSelectedSemester}
        >
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 mb-6">
            <TabsTrigger value="all" className="mb-1">
              All Notes
            </TabsTrigger>
            {semesters.map((semester) => (
              <TabsTrigger key={semester.id} value={semester.id} className="mb-1">
                {semester.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedSemester}>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm md:text-base">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-base md:text-lg text-muted-foreground">No notes available yet</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for updates</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {(selectedSemester === "all" ? notes : notes.filter(note => note.semester_id === selectedSemester)).map((note) => (
                  <Card key={note.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 text-sm md:text-base">{note.subject_name}</h3>
                        {note.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">{note.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mb-3">Downloads: {note.downloads || 0}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs md:text-sm h-8 md:h-9"
                            onClick={() => window.open(note.drive_link, "_blank")}
                          >
                            <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 text-xs md:text-sm h-8 md:h-9"
                            onClick={() => handleDownload(note.id, note.drive_link)}
                          >
                            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
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
