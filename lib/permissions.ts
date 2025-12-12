// lib/permissions.ts
import type { Role } from "../generated/prisma/client";

export function canManageTicket(role: Role) {
  return role === "ADMIN" || role === "AGENT";
}

export function canAssignTicket(role: Role) {
  return role === "ADMIN" || role === "AGENT";
}

export function canCreateTicket(role: Role) {
  // si querés que USER cree tickets, dejalo true
  return role === "ADMIN" || role === "AGENT" || role === "USER";
}
