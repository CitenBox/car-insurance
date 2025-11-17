//export interface IUser 
//token optional כי לא תמיד נחזיר אותו
export interface IUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  department?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  token?: string; 
}
