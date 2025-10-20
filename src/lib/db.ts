import { 
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Notes Collection
export const getNotes = async (semesterId?: string): Promise<Note[]> => {
  try {
    const notesRef = collection(db, 'notes');
    const q = semesterId 
      ? query(notesRef, where('semester_id', '==', semesterId), orderBy('subject_name'))
      : query(notesRef, orderBy('subject_name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  } catch (error) {
    throw error;
  }
};

export const updateNoteDownloads = async (noteId: string, downloads: number) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, { downloads: downloads + 1 });
  } catch (error) {
    throw error;
  }
};

// Announcements Collection
export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const createAnnouncement = async (data: { title: string; message: string; sent_by: string }) => {
  try {
    const announcementsRef = collection(db, 'announcements');
    await addDoc(announcementsRef, {
      ...data,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// Chat Collection
export const subscribeToChat = (
  subjectName: string, 
  isGeneral: boolean,
  callback: (messages: any[]) => void
) => {
  const chatRef = collection(db, 'chat_messages');
  const q = isGeneral
    ? query(chatRef, where('is_general', '==', true), orderBy('created_at'))
    : query(chatRef, where('subject_name', '==', subjectName), orderBy('created_at'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const sendChatMessage = async (data: {
  content: string;
  user_id: string;
  subject_name?: string;
  is_general: boolean;
}) => {
  try {
    const chatRef = collection(db, 'chat_messages');
    await addDoc(chatRef, {
      ...data,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

// Stats Collection
// Type definitions
export interface Note {
  id: string;
  subject_name: string;
  drive_link: string;
  downloads: number;
  semester_id?: string;
  semester_name?: string;
  description?: string;
}

export interface ExamSchedule {
  id?: string;
  subject: string;
  exam_date: string;
  exam_time: string;
  semester_id?: string;
  semester_name?: string;
}

export interface Semester {
  id: string;
  name: string;
  description?: string;
}

// Stats Collection
export const getStats = async () => {
  try {
    // Get notes count and total downloads
    const notesRef = collection(db, 'notes');
    const notesSnapshot = await getDocs(notesRef);
    const totalNotes = notesSnapshot.size;
    const totalDownloads = notesSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.downloads || 0);
    }, 0);

    // Get announcements count
    const announcementsRef = collection(db, 'announcements');
    const announcementsSnapshot = await getDocs(announcementsRef);
    const emailsSent = announcementsSnapshot.size;

    return {
      totalNotes,
      totalDownloads,
      emailsSent,
      totalUsers: 0 // Would need additional tracking
    };
  } catch (error) {
    throw error;
  }
};

// Exam Schedule Collection
export const getExamSchedules = async (semesterId?: string) => {
  try {
    const scheduleRef = collection(db, 'exam_schedules');
    const q = semesterId
      ? query(scheduleRef, where('semester_id', '==', semesterId), orderBy('exam_date', 'asc'))
      : query(scheduleRef, orderBy('exam_date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExamSchedule[];
  } catch (error) {
    throw error;
  }
};

export const createExamSchedule = async (data: Omit<ExamSchedule, 'id'>) => {
  try {
    const scheduleRef = collection(db, 'exam_schedules');
    await addDoc(scheduleRef, data);
  } catch (error) {
    throw error;
  }
};

export const updateExamSchedule = async (id: string, data: Partial<ExamSchedule>) => {
  try {
    const scheduleRef = doc(db, 'exam_schedules', id);
    await updateDoc(scheduleRef, data);
  } catch (error) {
    throw error;
  }
};

export const deleteExamSchedule = async (id: string) => {
  try {
    const scheduleRef = doc(db, 'exam_schedules', id);
    await deleteDoc(scheduleRef);
  } catch (error) {
    throw error;
  }
};

// Semesters Collection
export const getSemesters = async () => {
  try {
    const semestersRef = collection(db, 'semesters');
    const q = query(semestersRef, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Semester[];
  } catch (error) {
    throw error;
  }
};