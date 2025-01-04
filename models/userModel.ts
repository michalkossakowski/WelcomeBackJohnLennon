export interface User {
  id: string;
  username: string;
  password: string;
  avatar: string;
}
  
export interface Session {
  userId: string;
}

export interface UserBasics{
  id: string;
  username: string;
  avatar: string;
}

export interface UserServerRequest{
  userId: string;
  serverId: string;
}