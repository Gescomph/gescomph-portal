export interface ClauseSelect {
  id: number;
  name: string;
  active?: boolean;
}

export interface ClauseCreate {
  name: string;
  active?: boolean;
}

export interface ClauseUpdate {
  id: number;
  name: string;
  active?: boolean;
}


