import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const savedState = cookieStore.get("naver_oauth_state")?.value;
  cookieStore.delete("naver_oauth_state");

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=naver-state-mismatch`);
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
    client_secret: process.env.NAVER_CLIENT_SECRET!,
    code,
    state,
  });

  const tokenRes = await fetch(
    `https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`,
  );
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${origin}/login?error=naver-token-failed`);
  }

  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profileData = await profileRes.json();
  const { email, name } = profileData.response;

  const adminClient = createAdminClient();
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { data: { full_name: name } },
    });

  if (linkError || !linkData.properties?.hashed_token) {
    console.error("네이버 로그인 세션 생성 실패", linkError?.message);
    return NextResponse.redirect(`${origin}/login?error=naver-session-failed`);
  }

  const supabase = createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error("네이버 로그인 세션 검증 실패", verifyError.message);
    return NextResponse.redirect(`${origin}/login?error=naver-session-failed`);
  }

  return NextResponse.redirect(`${origin}/`);
}
