import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Note, Semester, getNotes, getSemesters } from "@/lib/db";
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function ManageNotes() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [formData, setFormData] = useState({
    subject_name: "",
    drive_link: "",
    description: "",
    semester_id: "",
    downloads: 0
  });

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/auth');
      } else {
        fetchSemesters();
        fetchNotes();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      toast.error("Failed to fetch semesters");
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to fetch notes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNote) {
        const noteRef = doc(db, 'notes', editingNote.id);
        await updateDoc(noteRef, formData);
        toast.success("Note updated successfully");
      } else {
        await addDoc(collection(db, 'notes'), formData);
        toast.success("Note added successfully");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(editingNote ? "Failed to update note" : "Failed to add note");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await deleteDoc(doc(db, 'notes', id));
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const resetForm = () => {
    setFormData({
      subject_name: "",
      drive_link: "",
      description: "",
      semester_id: "",
      downloads: 0
    });
    setEditingNote(null);
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setFormData({
      subject_name: note.subject_name,
      drive_link: note.drive_link,
      description: note.description || "",
      semester_id: note.semester_id || "",
      downloads: note.downloads || 0
    });
    setIsDialogOpen(true);
  };

  const filteredNotes = selectedSemester
    ? notes.filter(note => note.semester_id === selectedSemester)
    : notes;

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="flex justify-between items-start mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">Manage Notes</h1>
            <p className="text-lg text-muted-foreground">Add, edit, and delete course notes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Semester</Label>
                  <Select
                    value={formData.semester_id}
                    onValueChange={(value) => setFormData({ ...formData, semester_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.id}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-base font-semibold mb-2 block">Subject Name</Label>
                  <Input
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                
                <div>
                  <Label className="text-base font-semibold mb-2 block">Google Drive Link</Label>
                  <Input
                    required
                    type="url"
                    value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                
                <div>
                  <Label className="text-base font-semibold mb-2 block">Description (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the note"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" size="lg">
                    {editingNote ? "Update" : "Add"} Note
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem.id} value={sem.id}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-5 md:p-6 border-0 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{note.subject_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    {semesters.find(s => s.id === note.semester_id)?.name}
                  </p>
                  {note.description && (
                    <p className="text-sm text-muted-foreground mb-3">{note.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <a
                      href={note.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View/Download
                    </a>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {note.downloads || 0} downloads
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(note)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(note.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No notes found</p>
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
