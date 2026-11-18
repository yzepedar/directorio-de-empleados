import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEmployeesList, useDeleteEmployee } from '../hooks/useEmployees';
import { PAGE_LIMIT } from '../services/employeeService';
import { getErrorMessage } from '../utils/errors';
import { CreateEmployeeModal } from '../components/CreateEmployeeModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import type { Employee } from '../types/employee';

function parsePageParam(rawPage: string | null): number {
  if (!rawPage) return 1;
  const parsed = Number(rawPage);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

export function EmployeesPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parsePageParam(searchParams.get('page'));
  const currentQuery = searchParams.get('q') ?? '';

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useEmployeesList(
    currentPage,
    currentQuery
  );
  const deleteMutation = useDeleteEmployee();

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trimmed = String(formData.get('q') ?? '').trim();
    if (trimmed) {
      setSearchParams({ q: trimmed, page: '1' });
    } else {
      setSearchParams({ page: '1' });
    }
  };

  const handlePageChange = (newPage: number) => {
    const nextParams: Record<string, string> = { page: String(newPage) };
    if (currentQuery.trim()) {
      nextParams.q = currentQuery.trim();
    }
    setSearchParams(nextParams);
  };

  const handleDelete = (employee: Employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`;
    if (window.confirm(`¿Eliminar a ${fullName}? La API simula la baja.`)) {
      deleteMutation.mutate(employee.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_LIMIT) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Directorio de empleados</h1>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm font-medium">
                {session.firstName} {session.lastName}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-end gap-2 w-full sm:max-w-md">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="search-input">Buscar</Label>
              <Input
                key={currentQuery}
                id="search-input"
                name="q"
                type="text"
                defaultValue={currentQuery}
                placeholder="Nombre del empleado..."
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>

          <Button onClick={() => setIsModalOpen(true)}>Nuevo empleado</Button>
        </div>

        {isLoading && <p className="text-center py-8">Cargando…</p>}

        {isError && (
          <Alert variant="destructive" role="alert" className="flex items-center justify-between gap-4">
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </Alert>
        )}

        {!isLoading && !isError && data && (
          <>
            {currentQuery.trim() !== '' && data.total > 0 && (
              <p className="text-sm text-muted-foreground">{data.total} resultados</p>
            )}

            {data.users.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay resultados para la búsqueda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.users.map((emp) => {
                  const fullName = `${emp.firstName} ${emp.lastName}`;
                  return (
                    <article
                      key={emp.id}
                      className="border rounded-lg p-4 flex flex-col justify-between gap-4 bg-card"
                    >
                      <div className="space-y-3">
                        <img
                          src={emp.image}
                          alt={fullName}
                          className="w-20 h-20 rounded-full object-cover mx-auto border"
                        />
                        <div className="text-center space-y-1">
                          <h2 className="font-semibold text-base">{fullName}</h2>
                          <p className="text-xs text-muted-foreground">
                            {emp.company.department}
                          </p>
                          <p className="text-xs font-medium">{emp.company.title}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {emp.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t">
                        <Link
                          to={`/empleados/${emp.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Ver detalle
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label={`Eliminar ${fullName}`}
                          onClick={() => handleDelete(emp)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <CreateEmployeeModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}