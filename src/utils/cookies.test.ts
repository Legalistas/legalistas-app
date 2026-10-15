// Se corre con `bun run test`. La sesión de la app depende de leer bien estas cabeceras.
import assert from "node:assert/strict";
import { leerCookies } from "./cookies";

const SESION = "__Secure-legalistas.session_token";

// Entrar: llegan la sesión y su copia de 5 minutos, juntas y con una coma en la fecha.
const alEntrar = leerCookies(
  `${SESION}=abc.firma%3D; Max-Age=5184000; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/; HttpOnly; Secure; SameSite=Lax, __Secure-legalistas.session_data=eyJ4IjoxfQ; Max-Age=300; Path=/`,
  {},
);
assert.deepEqual(alEntrar, { [SESION]: "abc.firma%3D" });

// Dos pasos: cookie temporal; al verificar se borra y llegan la sesión y "recordar dispositivo".
const pendiente = leerCookies("legalistas.two_factor=t1.f; Max-Age=600; Path=/", {});
assert.deepEqual(pendiente, { "legalistas.two_factor": "t1.f" });
assert.deepEqual(
  leerCookies(
    "legalistas.two_factor=; Max-Age=0; Path=/, legalistas.session_token=s.f; Max-Age=5184000, legalistas.trust_device=d.f; Max-Age=2592000",
    pendiente,
  ),
  { "legalistas.session_token": "s.f", "legalistas.trust_device": "d.f" },
);

// Cerrar sesión: el servidor la borra con Max-Age=0.
assert.deepEqual(leerCookies(`${SESION}=; Max-Age=0; Path=/`, alEntrar), {});

// Sin cabecera no cambia nada.
assert.deepEqual(leerCookies(null, alEntrar), alEntrar);

console.log("cookies: ok");
