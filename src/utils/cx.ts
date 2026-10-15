/** Junta clases de Tailwind salteando las que no aplican (`condicion && "clase"`). */
export const cx = (...clases: (string | false | null | undefined)[]) =>
  clases.filter(Boolean).join(" ");
