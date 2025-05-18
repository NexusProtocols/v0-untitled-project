export interface ScriptBloxScript {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    username: string;
    joinDate: string;
  };
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  content: string;
}

export interface ScriptBloxProfile {
  id: string;
  username: string;
  joinDate: string;
  scripts: ScriptBloxScript[];
}

export interface Script {
  id: string;
  title: string;
  description: string;
  content: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
}

export interface Profile {
  id: string;
  username: string;
  joinDate: string;
} 
