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
import { Plus, Pencil, Trash2 } from "lucide-react";

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
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Notes</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Add New Note"}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Semester</Label>
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
                  <Label>Subject Name</Label>
                  <Input
                    required
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                
                <div>
                  <Label>Google Drive Link</Label>
                  <Input
                    required
                    type="url"
                    value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the note"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingNote ? "Update" : "Add"} Note
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

        <div className="mb-4">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem.id} value={sem.id}>
                  {sem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{note.subject_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {semesters.find(s => s.id === note.semester_id)?.name}
                  </p>
                  {note.description && (
                    <p className="text-sm mb-2">{note.description}</p>
                  )}
                  <a
                    href={note.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View/Download
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">
                    Downloads: {note.downloads || 0}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(note)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredNotes.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No notes found. Add your first note!</p>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
