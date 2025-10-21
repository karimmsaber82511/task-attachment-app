export interface Attachment {
  attachmentId: number;
  messageId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadDate: Date;
  // Additional properties needed by the template
  type: string;
  url: string;
  name: string;
}

export interface Reaction {
  reactionId?: number;
  messageId: number;
  userId: number;
  username?: string;
  emoji: string;
  createdAt?: Date;
}

export interface Message {
  messageId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: Attachment[];
  reactions?: Reaction[];
}
