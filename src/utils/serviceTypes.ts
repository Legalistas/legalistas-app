// Tipos de servicios legales

export type ServiceType = {
  id: number;
  value: number;
  label: string;
};

// Servicios disponibles
export const servicesType: ServiceType[] = [
  { id: 1, value: 1, label: "Acc. de trabajo" },
  { id: 2, value: 2, label: "Acc. de tránsito" },
  { id: 3, value: 3, label: "Jubilaciones" },
  { id: 4, value: 4, label: "Sucesiones" },
  { id: 5, value: 5, label: "Daños y materiales" },
  { id: 6, value: 6, label: "Despidos" },
];

/**
 * Obtiene el nombre del servicio según su ID
 */
export const getServiceName = (
  serviceId: number | string | null | undefined,
): string => {
  if (serviceId === null || serviceId === undefined) return "Sin categoría";

  const serviceIdNum =
    typeof serviceId === "string" ? Number.parseInt(serviceId, 10) : serviceId;

  const service = servicesType.find(
    (s: { value: number }) => s.value === serviceIdNum,
  );

  return service ? service.label : "Desconocido";
};
