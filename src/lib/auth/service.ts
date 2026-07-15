type AuthClient = {
  auth: {
    signInWithOtp(input: { email: string; options: { shouldCreateUser: boolean } }): Promise<{ error: unknown }>;
    verifyOtp(input: { email: string; token: string; type: "email" }): Promise<{ error: unknown }>;
    signOut(): Promise<{ error: unknown }>;
  };
};

export function createAuthService(client: AuthClient) {
  return {
    async requestEmailCode(email: string) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
    },
    async verifyEmailCode(email: string, token: string) {
      const { error } = await client.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
  };
}
