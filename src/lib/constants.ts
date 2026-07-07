// Single source of truth for the "enum-like" String fields (SQLite has no enums).

export const ROLES = ["SUPER_ADMIN", "TREASURER", "SECRETARY", "MEMBER"] as const;
export type Role = (typeof ROLES)[number];

export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "TREASURER", "SECRETARY"];

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DUE_STATUSES = ["PENDING", "PAID", "OVERDUE", "WAIVED"] as const;
export type DueStatus = (typeof DUE_STATUSES)[number];

export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  TREASURER: "Treasurer",
  SECRETARY: "Secretary",
  MEMBER: "Member",
};
