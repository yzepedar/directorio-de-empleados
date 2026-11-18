import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
} from '../services/employeeService';
import { getErrorMessage } from '../utils/errors';

export function useEmployeesList(page: number, query: string) {
  return useQuery({
    queryKey: ['employees', page, query],
    queryFn: () => getEmployees(page, query),
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeDetail(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(id),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success('Empleado creado (la API lo simula y no lo guarda).');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success('Empleado eliminado (simulado).');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}