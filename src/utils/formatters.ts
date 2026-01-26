// Utilidades para formatear fechas, números y montos

/**
 * Formatea una fecha en formato corto (ej: "23 ene 2026")
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "Sin fecha";

  try {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

/**
 * Formatea una fecha con hora (ej: "23 ene 2026, 14:30")
 */
export const formatDateWithTime = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "Sin fecha";

  try {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

/**
 * Formatea una fecha en formato completo (ej: "lunes, 23 de enero de 2026")
 */
export const formatDateLong = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "Sin fecha";

  try {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

/**
 * Formatea solo la hora (ej: "14:30")
 */
export const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return "--:--";

  try {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "--:--";
  }
};

/**
 * Obtiene el mes y día para mostrar en tarjetas (ej: { month: "ENE", day: "23" })
 */
export const getMonthDay = (
  date: Date | string | null | undefined,
): { month: string; day: string } => {
  if (!date) return { month: "--", day: "--" };

  try {
    const d = new Date(date);
    const month = d
      .toLocaleDateString("es-ES", { month: "short" })
      .toUpperCase();
    const day = d.getDate().toString();
    return { month, day };
  } catch (error) {
    return { month: "--", day: "--" };
  }
};

/**
 * Formatea un número con separadores de miles (ej: 1234567 -> "1.234.567")
 */
export const formatNumber = (
  num: number | string | null | undefined,
): string => {
  if (num === null || num === undefined) return "0";

  try {
    const number = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("es-AR").format(number);
  } catch (error) {
    return "0";
  }
};

/**
 * Formatea un monto en pesos argentinos (ej: 1234.56 -> "$1.234,56")
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
): string => {
  if (amount === null || amount === undefined) return "$0,00";

  try {
    const number = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(number);
  } catch (error) {
    return "$0,00";
  }
};

/**
 * Calcula el tiempo relativo desde una fecha (ej: "hace 2 horas", "hace 3 días")
 */
export const getRelativeTime = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "Fecha desconocida";

  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60)
      return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    if (diffHours < 24)
      return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays < 7)
      return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
    }
    const years = Math.floor(diffDays / 365);
    return `Hace ${years} ${years === 1 ? "año" : "años"}`;
  } catch (error) {
    return "Fecha inválida";
  }
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;

  try {
    const today = new Date();
    const d = new Date(date);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Formatea un porcentaje (ej: 0.65 -> "65%")
 */
export const formatPercentage = (
  value: number | null | undefined,
  decimals = 0,
): string => {
  if (value === null || value === undefined) return "0%";

  try {
    return `${(value * 100).toFixed(decimals)}%`;
  } catch (error) {
    return "0%";
  }
};
