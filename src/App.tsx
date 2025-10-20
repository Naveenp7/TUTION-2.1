import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Schedule from "./pages/Schedule";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageNotes from "./pages/admin/ManageNotes";
import ManageSemesters from "./pages/admin/ManageSemesters";
import ManageTimetable from "./pages/admin/ManageTimetable";
import SendAnnouncements from "./pages/admin/SendAnnouncements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:semester" element={<Notes />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/notes" element={<ManageNotes />} />
          <Route path="/admin/semesters" element={<ManageSemesters />} />
          <Route path="/admin/timetable" element={<ManageTimetable />} />
          <Route path="/admin/announcements" element={<SendAnnouncements />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
