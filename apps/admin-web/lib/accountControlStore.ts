export function bootstrapSignedInUser(store: AccountStore, email: string): AccountStore {
  const existing = getAccountByEmail(store.accounts, email);
  if (existing) return store;

  // If the user isn't in the store yet, let's create a default SYS profile for them
  // This ensures they don't get locked out of the system!
  const newAccount: Account = {
    id: uuid(),
    email,
    name: email.split("@")[0] || "System Admin",
    role: "SYS",
    status: "ACTIVE",
    createdAt: nowIso(),
    createdBy: "SYSTEM",
  };

  return {
    ...store,
    accounts: [newAccount, ...store.accounts],
  };
}