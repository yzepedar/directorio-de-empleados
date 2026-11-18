export interface UserSession {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  image: string;
  company: {
    department: string;
    title: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
  };
}

export interface EmployeesResponse {
  users: Employee[];
  total: number;
  skip: number;
  limit: number;
}