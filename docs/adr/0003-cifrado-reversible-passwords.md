# ADR 0003 — Cifrado reversible (AES-256-CBC) para contraseñas

**Estado:** Aceptada · **Fecha:** 2026-06

## Contexto

El legacy guarda contraseñas en texto plano. El requerimiento pide migrarlas conservando los
mismos valores pero cifrados, **e implementar descifrado** para poder leerlas y autenticar.

## Opciones consideradas

1. **Hash unidireccional (bcrypt/argon2):** el estándar de la industria para contraseñas.
2. **Cifrado simétrico reversible (AES-256-CBC):** con IV aleatorio por contraseña, formato
   `iv_hex:ciphertext_hex`, clave en variable de entorno.

## Decisión

AES-256-CBC. bcrypt es unidireccional por diseño y no permite recuperar el valor original,
lo que el requerimiento exige explícitamente.

## Consecuencias

- **Corto plazo:** se cumple el requisito; el login descifra y compara. El IV aleatorio evita
  que dos contraseñas iguales produzcan el mismo ciphertext.
- **Largo plazo:** cifrado reversible es **menos seguro** que un hash — si se filtra la
  `CIPHER_KEY`, se recuperan todas las contraseñas. Queda documentado como deuda: para
  producción real lo correcto sería migrar a bcrypt/argon2 si se elimina el requisito de
  descifrado. La clave vive en `.env`, nunca en el código.
