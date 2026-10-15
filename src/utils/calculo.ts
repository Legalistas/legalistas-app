// Estimación de la indemnización por incapacidad permanente (Ley 24.557, art.
// 14.2.a): 53 × ingreso base × (65 / edad) × % de incapacidad. El ingreso se
// actualiza con la variación del RIPTE. Si el accidente fue en el lugar de
// trabajo (no in itinere) se suma el 20 % adicional del art. 3 de la Ley 26.773.
// Misma fórmula que tenía la calculadora anterior del portal.

export interface DatosCalculo {
  edad: number;
  incapacidad: number;
  ingresoMensual: number;
  variacionRipte: number;
  enElTrabajo: boolean;
}

export function calcularIndemnizacion(d: DatosCalculo) {
  const ingresoActualizado = d.ingresoMensual * (1 + d.variacionRipte / 100);
  const base = 53 * ingresoActualizado * (65 / d.edad) * (d.incapacidad / 100);
  const adicional = d.enElTrabajo ? base * 0.2 : 0;
  return { ingresoActualizado, base, adicional, total: base + adicional };
}
