import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      const claims = (profile ?? {}) as Record<string, unknown>;
      const realmAccess = claims.realm_access as { roles?: string[] } | undefined;
      token.roles = realmAccess?.roles ?? [];
      token.employeeId = typeof claims.employee_id === "string" ? claims.employee_id : null;
      token.branchId = typeof claims.branch_id === "string" ? claims.branch_id : null;
      token.zoneCode = typeof claims.zone_code === "string" ? claims.zone_code : null;
      token.portalAccess = Array.isArray(claims.portal_access) ? claims.portal_access.map(String) : [];
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.roles = Array.isArray(token.roles) ? token.roles.map(String) : [];
      session.user.employeeId = typeof token.employeeId === "string" ? token.employeeId : null;
      session.user.branchId = typeof token.branchId === "string" ? token.branchId : null;
      session.user.zoneCode = typeof token.zoneCode === "string" ? token.zoneCode : null;
      session.user.portalAccess = Array.isArray(token.portalAccess) ? token.portalAccess.map(String) : [];
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
