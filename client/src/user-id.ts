let userId = null;

export function getUserId(): string {
  // User ID is the same for one session but changes when you reload
  if (!userId) {
    userId = crypto.randomUUID();
  }
  return userId;
}
