import { api, publicApi } from './api';
import type { Employee, EmployeesResponse, UserSession } from '../types/employee';

const SELECT_FIELDS = 'firstName,lastName,email,phone,age,image,company,address';
export const PAGE_LIMIT = 8;

export async function loginRequest(username: string, password: string): Promise<UserSession> {
  const { data } = await publicApi.post<UserSession>('/auth/login', {
    username,
    password,
    expiresInMins: 1,
  });
  return data;
}

export async function getEmployees(page: number, query: string): Promise<EmployeesResponse> {
  const skip = (page - 1) * PAGE_LIMIT;
  const endpoint = query.trim() ? '/auth/users/search' : '/auth/users';

  const { data } = await api.get<EmployeesResponse>(endpoint, {
    params: {
      ...(query.trim() ? { q: query.trim() } : {}),
      limit: PAGE_LIMIT,
      skip,
      select: SELECT_FIELDS,
    },
  });
  return data;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const { data } = await api.get<Employee>(`/auth/users/${id}`, {
    params: { select: SELECT_FIELDS },
  });
  return data;
}

export async function createEmployee(formData: FormData): Promise<Employee> {
  const { data } = await api.post<Employee>('/users/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function downloadEmployeeImage(imageUrl: string): Promise<Blob> {
  const { data } = await api.get<Blob>(imageUrl, {
    responseType: 'blob',
  });
  return data;
}