// Utilidades para manejar los stages (etapas) de las causas

export interface StageColors {
  background: string;
  text: string;
  border: string;
  progressBar: string;
}

export const getStageColors = (stageId?: number): StageColors => {
  switch (stageId) {
    case 1: // Documentación Pendiente
      return {
        background: "#fff7ed",
        text: "#c2410c",
        border: "#fed7aa",
        progressBar: "#fb923c",
      };
    case 2: // Caso En Trámite
      return {
        background: "#eff6ff",
        text: "#1d4ed8",
        border: "#bfdbfe",
        progressBar: "#3b82f6",
      };
    case 3: // Cierre Logrado
      return {
        background: "#f0fdf4",
        text: "#15803d",
        border: "#bbf7d0",
        progressBar: "#22c55e",
      };
    case 4: // Cobrado
      return {
        background: "#ecfdf5",
        text: "#047857",
        border: "#a7f3d0",
        progressBar: "#10b981",
      };
    case 5: // Experiencia
      return {
        background: "#faf5ff",
        text: "#7e22ce",
        border: "#e9d5ff",
        progressBar: "#a855f7",
      };
    case 6: // Cerrado
      return {
        background: "#f9fafb",
        text: "#374151",
        border: "#d1d5db",
        progressBar: "#6b7280",
      };
    default:
      return {
        background: "#f9fafb",
        text: "#374151",
        border: "#d1d5db",
        progressBar: "#6b7280",
      };
  }
};

export const getStageIconName = (stageId?: number): string => {
  switch (stageId) {
    case 1: // Documentación Pendiente
      return "alert-circle-outline";
    case 2: // Caso En Trámite
      return "time-outline";
    case 3: // Cierre Logrado
      return "checkmark-circle-outline";
    case 4: // Cobrado
      return "cash-outline";
    case 5: // Experiencia
      return "star-outline";
    case 6: // Cerrado
      return "archive-outline";
    default:
      return "ellipse";
  }
};

export const getStageName = (stageId?: number): string => {
  switch (stageId) {
    case 1:
      return "Documentación Pendiente";
    case 2:
      return "Caso En Trámite";
    case 3:
      return "Cierre Logrado";
    case 4:
      return "Cobrado";
    case 5:
      return "Experiencia";
    case 6:
      return "Cerrado";
    default:
      return "Sin estado";
  }
};

// Función para calcular el progreso basado en el stage
export const getProgressFromStage = (stageId?: number): number => {
  switch (stageId) {
    case 1:
      return 15; // Documentación Pendiente
    case 2:
      return 40; // Caso En Trámite
    case 3:
      return 65; // Cierre Logrado
    case 4:
      return 85; // Cobrado
    case 5:
      return 95; // Experiencia
    case 6:
      return 100; // Cerrado
    default:
      return 0;
  }
};
