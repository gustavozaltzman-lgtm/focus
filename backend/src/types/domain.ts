export type TaskStatus = 'inbox' | 'today' | 'upcoming' | 'someday' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'sent' | 'snoozed';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, 'password_hash'>;

export interface Context {
  id: string;
  user_id: string;
  name: string;
  color_hex: string;
  created_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  context_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_date: string | null;
  scheduled_time: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Reminder {
  id: string;
  task_id: string;
  trigger_at: Date;
  status: ReminderStatus;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string | null;
  action: string;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
}
