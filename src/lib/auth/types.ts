import type { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
};
