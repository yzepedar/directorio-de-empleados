import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee } from '../hooks/useEmployees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(2, 'El nombre necesita al menos 2 caracteres'),
  lastName: z.string().trim().min(2, 'El apellido necesita al menos 2 caracteres'),
  email: z.string().trim().email('Escriba un correo válido'),
  age: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!/^\d+$/.test(val)) return false;
        const num = Number(val);
        return Number.isInteger(num) && num >= 18 && num <= 99;
      },
      { message: 'La edad debe ser un entero entre 18 y 99' }
    ),
});

type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

interface CreateEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEmployeeModal({ open, onOpenChange }: CreateEmployeeModalProps) {
  const createMutation = useCreateEmployee();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
    },
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSelectedFile(null);
      setFileError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Solo se permiten imágenes JPG o PNG.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('La imagen supera 1 MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = (values: CreateEmployeeFormValues) => {
    if (fileError) return;

    const formData = new FormData();
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('email', values.email);
    formData.append('age', values.age.trim());

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        handleClose(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo empleado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="age">Edad</Label>
            <Input id="age" type="number" {...register('age')} />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photo">Fotografía (JPG o PNG, máx. 1 MB)</Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="mt-2 h-24 w-24 rounded-md object-cover border"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}