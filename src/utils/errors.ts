import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Ocurrió un error inesperado.';
  }

  if (!error.response) {
    return 'Sin conexión con el servidor. Verifique su internet.';
  }

  const status = error.response.status;

  if (status === 400) return 'Los datos enviados no son válidos.';
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.';
  if (status === 403) return 'No tiene permiso para realizar esta acción.';
  if (status === 404) return 'No se encontró el recurso solicitado.';
  if (status === 429) return 'Demasiadas solicitudes. Espere un momento.';
  if (status >= 500) return 'Error del servidor. Intente más tarde.';

  return 'Ocurrió un error inesperado.';
}