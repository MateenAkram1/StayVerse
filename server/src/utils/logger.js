/* eslint-disable no-console */
export function logger(...args) {
  if (process.env.NODE_ENV === "test") return;
  console.log("[StayVerse]", new Date().toISOString(), ...args);
}
