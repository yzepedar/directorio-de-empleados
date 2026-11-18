import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEmployeeDetail } from '../hooks/useEmployees';
import { downloadEmployeeImage } from '../services/employeeService';
import { getErrorMessage } from '../utils/errors';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export function EmployeeDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: employee, isLoading, isError, error } = useEmployeeDetail(id);
  const [isDownloadingImg, setIsDownloadingImg] = useState(false);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async () => {
    if (!employee) return;
    setIsDownloadingImg(true);
    try {
      const blob = await downloadEmployeeImage(employee.image);
      triggerDownload(blob, `empleado-${employee.id}.png`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDownloadingImg(false);
    }
  };

  const handleDownloadCard = () => {
    if (!employee) return;
    const content = [
      `Empleado: ${employee.firstName} ${employee.lastName}`,
      `Cargo: ${employee.company.title}`,
      `Departamento: ${employee.company.department}`,
      `Correo: ${employee.email}`,
      `Teléfono: ${employee.phone}`,
      `Edad: ${employee.age}`,
      `Dirección: ${employee.address.address}, ${employee.address.city}, ${employee.address.state}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `empleado-${employee.id}.txt`);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        to="/empleados"
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        ← Volver al listado
      </Link>

      {isLoading && <p className="py-8">Cargando…</p>}

      {isError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {employee && (
        <div className="border rounded-lg p-6 bg-card space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={employee.image}
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-32 h-32 rounded-full object-cover border"
            />
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-muted-foreground">
                {employee.company.department} · {employee.company.title}
              </p>

              <dl className="pt-3 space-y-1.5 text-sm">
                <div>
                  <dt className="inline font-semibold">Correo: </dt>
                  <dd className="inline">{employee.email}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Teléfono: </dt>
                  <dd className="inline">{employee.phone}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Edad: </dt>
                  <dd className="inline">{employee.age}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Dirección: </dt>
                  <dd className="inline">
                    {employee.address.address}, {employee.address.city},{' '}
                    {employee.address.state}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDownloadImage}
              disabled={isDownloadingImg}
            >
              Descargar imagen
            </Button>
            <Button onClick={handleDownloadCard}>Descargar ficha</Button>
          </div>
        </div>
      )}
    </main>
  );
}