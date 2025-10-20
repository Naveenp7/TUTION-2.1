# Collection: admins
- Document ID: admin@example.com (replace with your admin email)
  {
    "role": "admin",
    "created_at": timestamp
  }

# Collection: notes
- Fields:
  - subject_name: string
  - drive_link: string
  - downloads: number
  - semester_id: string (optional)
  - semester_name: string (optional)
  - description: string (optional)

# Collection: announcements
- Fields:
  - title: string
  - message: string
  - sent_by: string (user id)
  - created_at: timestamp

# Collection: chat_messages
- Fields:
  - content: string
  - user_id: string
  - user_name: string
  - subject_name: string (optional)
  - is_general: boolean
  - created_at: timestamp