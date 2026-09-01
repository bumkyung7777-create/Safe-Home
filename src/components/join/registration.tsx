"use client";
import "./join.css";
import { ChangeEvent, useState } from "react";
type PropertyForm = {
  title: string;
  address: string;
  subAddress?: string;
  type: string;
  price: string;
  deposit: string;
  data: string;
  firstPrice?: number;
  secondPrice?: number;
  choice?: [];
};

const initialForm: PropertyForm = {
  title: "",
  address: "",
  subAddress: "",
  type: "",
  price: "",
  deposit: "",
  data: "",
  firstPrice: 0,
  secondPrice: 0,
  choice: [],
};
export default function Registration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<PropertyForm>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleNext() {
    setErrorMessage("");
    console.log("현재 단계:", currentStep);
    // Step 1 검증
    if (currentStep === 1 && !form.address.trim()) {
      setErrorMessage("주소 입력해 주세요.");
      return;
    } else if (currentStep === 1 && !form.type.trim()) {
      setErrorMessage("건물 유형을 체크해주세요.");
      return;
    }

    // Step 2 검증
    if (currentStep === 2 && !form.title.trim()) {
      setErrorMessage("매물 제목을 입력해 주세요.");
      return;
    } else if (currentStep === 2 && !form.deposit.trim()) {
      setErrorMessage("상세 설명 입력해 주세요.");
      return;
    }

    setCurrentStep((previous) => previous + 1);
  }

  function handlePrevious() {
    setErrorMessage("");
    setCurrentStep((previous) => previous - 1);
  }

  function handleSave() {
    // 지금은 DB에 저장하지 않고 콘솔에서만 값 확인
    console.log("최종 저장할 매물 데이터:", form);

    alert("콘솔에서 저장할 데이터를 확인해 보세요.");
  }

  return (
    <div>
      {/* Step 1 */}
      {currentStep === 1 && (
        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">1. 기본 정보</h2>

          <label className="mt-5 grid gap-2">
            <span className="text-sm font-medium">매물 제목</span>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="예: 서울 강남구 역삼동 오피스텔"
              className="rounded-md border px-3 py-2"
            />
          </label>
        </section>
      )}
      {/* Step 2 */}
      {currentStep === 2 && (
        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">2. 위치 정보</h2>

          <label className="mt-5 grid gap-2">
            <span className="text-sm font-medium">주소</span>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="예: 서울특별시 강남구 테헤란로 123"
              className="rounded-md border px-3 py-2"
            />
          </label>
        </section>
      )}
      {/* Step 3 */}
      {currentStep === 3 && (
        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-lg font-semibold">3. 가격 및 최종 확인</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">매매가</span>

              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="예: 350000000"
                className="rounded-md border px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">보증금</span>

              <input
                name="deposit"
                type="number"
                value={form.deposit}
                onChange={handleChange}
                placeholder="예: 50000000"
                className="rounded-md border px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold">입력 내용 확인</h3>

            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">매물 제목</dt>
                <dd>{form.title || "-"}</dd>
              </div>

              <div>
                <dt className="text-gray-500">주소</dt>
                <dd>{form.address || "-"}</dd>
              </div>

              <div>
                <dt className="text-gray-500">매매가</dt>
                <dd>
                  {form.price
                    ? `${Number(form.price).toLocaleString("ko-KR")}원`
                    : "-"}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">보증금</dt>
                <dd>
                  {form.deposit
                    ? `${Number(form.deposit).toLocaleString("ko-KR")}원`
                    : "-"}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}
      <div className="mt-8 flex justify-between border-t pt-5">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevious}
            className="rounded-md border px-4 py-2 text-sm"
          >
            이전
          </button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            임시저장
          </button>
        )}
      </div>
    </div>
  );
}
