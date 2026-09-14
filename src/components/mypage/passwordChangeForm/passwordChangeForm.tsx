"useClient";
import { ShieldCheck, KeyRound } from "lucide-react";
export const PasswordChangeForm = () => {
  function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    alert("비밀번호가 안전하게 변경되었습니다.");
  }
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* 보안 및 비밀번호 변경 */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#002045]">
              <KeyRound className="h-5 w-5" />
            </div>
            <span className="text-lg text-[#002045] font-bold">
              보안 및 비밀번호 변경
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
            보안 1등급
          </span>
        </div>

        <p className="text-[13px] text-gray-500">
          안심 매물 등록 권한과 에스크로 계좌 보호를 위해 주기적으로 비밀번호를
          변경해 주세요.
        </p>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-[#002045] font-semibold">
              현재 비밀번호
            </span>
            <input
              type="password"
              placeholder="기존 비밀번호 입력"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[#002045] font-semibold">
              새 비밀번호
            </span>
            <input
              type="password"
              placeholder="영문, 숫자, 특수문자 조합 8자 이상"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-[#002045] font-semibold">
              새 비밀번호 확인
            </span>
            <input
              type="password"
              placeholder="새 비밀번호 재입력"
              className="w-full px-3 py-2 rounded-lg bg-gray-50 text-gray-800 text-sm focus:outline-none focus:bg-gray-100 transition-colors"
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-lg bg-[#002045] hover:bg-[#002045]/90 text-white text-sm font-bold transition-shadow shadow-sm flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="h-[18px] w-[18px]" />
            <span>비밀번호 변경하기</span>
          </button>
        </form>

        <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
          <span>최근 보안 업데이트: 2025.02.10</span>
          <a href="#" className="text-[#002045] font-semibold hover:underline">
            로그인 기기 관리 (2)
          </a>
        </div>
      </div>
    </div>
  );
};
