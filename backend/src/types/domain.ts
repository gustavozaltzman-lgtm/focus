export type TaskStatus = 'inbox' | 'today' | 'upcoming' | 'someday' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'sent' | 'snoozed';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string | null;
  anthropic_api_key_encrypted: string | null;
  anthropic_api_key_last4: string | null;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<
  User,
  'password_hash' | 'anthropic_api_key_encrypted' | 'anthropic_api_key_last4'
> & {
  hasAnthropicKey: boolean;
  anthropicKeyLast4: string | null;
};

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
  due_date: string | null;
  source_ref: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  has_reminder?: boolean;
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
