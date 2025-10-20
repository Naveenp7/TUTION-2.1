import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Semester, getSemesters } from "@/lib/db";
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ManageSemesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/auth');
      } else {
        fetchSemesters();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSemester) {
        const semesterRef = doc(db, 'semesters', editingSemester.id);
        await updateDoc(semesterRef, formData);
        toast.success("Semester updated successfully");
      } else {
        await addDoc(collection(db, 'semesters'), formData);
        toast.success("Semester added successfully");
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchSemesters();
    } catch (error) {
      console.error("Error saving semester:", error);
      toast.error(editingSemester ? "Failed to update semester" : "Failed to add semester");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all notes in this semester!")) return;
    
    try {
      await deleteDoc(doc(db, 'semesters', id));
      toast.success("Semester deleted successfully");
      fetchSemesters();
    } catch (error) {
      console.error("Error deleting semester:", error);
      toast.error("Failed to delete semester");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingSemester(null);
  };

  const openEditDialog = (semester: Semester) => {
    setEditingSemester(semester);
    setFormData({
      name: semester.name,
      description: semester.description || ""
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen pb-32 md:pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Semesters</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSemester ? "Edit Semester" : "Add New Semester"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Semester Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Semester 7"
                  />
                </div>
                
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the semester"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingSemester ? "Update" : "Add"} Semester
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

        <div className="grid gap-4">
          {semesters.map((semester) => (
            <Card key={semester.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{semester.name}</h3>
                  {semester.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {semester.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(semester)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(semester.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {semesters.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No semesters found. Add your first semester!
              </p>
            </Card>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
