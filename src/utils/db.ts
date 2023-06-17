import type { User } from "@prisma/client";
/**
 * prisma don't have built in functionality to execlude fields so this function execlude fields from prisma model
 * ! only works with User model
 * @param user
 * @param keys
 * @returns
 */
export function excludePrismaFields<T extends User, Key extends keyof T>(
  user: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    delete user[key];
  }
  return user;
}
