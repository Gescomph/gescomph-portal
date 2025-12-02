export interface ClauseSelect {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

export interface ClauseCreate {
  name: string;
  description: string;
  active?: boolean;
}

export interface ClauseUpdate {
  id: number;
  name: string;
  description: string;
  active?: boolean;
}


