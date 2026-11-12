"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Role } from "@/types/user";

const AuthContext = createContext<User | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// user_metadata에서 자주 꺼내 쓰는 값들을 기본값과 함께 한 곳에서 정리해서 돌려주는 훅
export function useUserProfile() {
  const user = useAuth();

  return {
    user,
    // 역할 정보가 없는 사용자(카카오·네이버 소셜 로그인)는 가장 권한이 적은 "세입자"로 처리
    // → 기본값이 landlord면 소셜 가입만 해도 매물 등록 메뉴가 열려버림
    //   (DB의 profiles 트리거도 기본값이 'tenant'라서 둘을 맞춤)
    role: (user?.user_metadata?.role as Role | undefined) ?? "tenant",
    fullName: user?.user_metadata?.full_name ?? "사용자 이름",
    phone: (user?.user_metadata?.phone as string | undefined) ?? "010-0000-0000",
    createdAt: (user?.created_at ?? "2023-01-01").slice(0, 10),
    updatedAt: (user?.updated_at ?? "2023-01-01").slice(0, 10),
  };
}
