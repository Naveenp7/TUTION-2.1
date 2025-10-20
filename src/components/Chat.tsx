import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { onAuthStateChange } from "@/lib/auth";
import { subscribeToChat, sendChatMessage } from "@/lib/db";

interface ChatProps {
  subjectName?: string;
  isGeneral?: boolean;
}

export function Chat({ subjectName, isGeneral = false }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChange((currentUser) => {
      setUser(currentUser);
    });

    const unsubscribeChat = subscribeToChat(
      subjectName,
      isGeneral,
      (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeChat();
    };
  }, [subjectName, isGeneral]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) {
      if (!user) toast.error("Please login to send messages");
      return;
    }

    try {
      const messageData: any = {
        content: newMessage.trim(),
        user_id: user.uid,
        is_general: isGeneral,
      };

      if (!isGeneral && subjectName) {
        messageData.subject_name = subjectName;
      }

      await sendChatMessage(messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">
              {isGeneral ? "General Chat" : `${subjectName} Chat`}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.user_id === user?.uid ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.user_id === user?.uid
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.user_name}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(msg.created_at), "p")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" className="self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}