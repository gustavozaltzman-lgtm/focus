export type TaskStatus = 'inbox' | 'today' | 'upcoming' | 'someday' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Context {
  id: string;
  user_id: string;
  name: string;
  color_hex: string;
  created_at: string;
  active_task_count?: number;
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
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  has_reminder?: boolean;
}

export interface DashboardSummary {
  urgentCount: number;
  scheduledCount: number;
  inboxCount: number;
  overdueCount: number;
  completedThisWeekCount: number;
  todayTasks: Task[];
}
