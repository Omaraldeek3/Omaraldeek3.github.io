export type Status = "todo" | "doing" | "done";
export type Priority = "low" | "medium" | "high";

export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  dueDate: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  dueDate: string;
  createdAt: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Workspace = {
  name: string;
  user: { name: string; email: string; isGuest: boolean };
  projects: Project[];
  tasks: Task[];
  members: Member[];
};
