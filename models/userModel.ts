export interface User {
  id: string;
  username: string;
  password: string;
}
  
export interface Session {
  userId: string;
}

export interface UserBasics{
  id: string;
  username: string;
}

export interface UserServerRequest{
  userId: string;
  serverId: string;
}