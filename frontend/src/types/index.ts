export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'pro';
  isEmailVerified: boolean;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
  order: number;
  isInbox: boolean;
  parentProjectId?: string;
  userId: string;
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3 | 4;
  deadline?: string;
  deadlineTime?: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
  projectId?: string;
  sectionId?: string;
  parentTaskId?: string;
  subtasks?: Task[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Label {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'pro';
  isEmailVerified: boolean;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  emoji?: string;
  order: number;
  isInbox: boolean;
  parentProjectId?: string;
  userId: string;
  createdAt: string;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3 | 4;
  deadline?: string;
  deadlineTime?: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
  projectId?: string;
  sectionId?: string;
  parentTaskId?: string;
  subtasks?: Task[];
  labels?: Label[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}