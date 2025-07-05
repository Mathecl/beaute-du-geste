export interface UserData {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  signin: boolean;
  verified: boolean;
}

let users: UserData[] = [
  {
    id: 'id',
    email: 'email',
    name: 'name',
    company: 'company',
    role: 'guest',
    signin: false,
    verified: false,
  },
];

export function updateUser(updatedData: Partial<UserData>): void {
  users = users.map((user) => ({ ...user, ...updatedData }));
}
