"use client";
import "./join.css";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import DaumPostcodeEmbed, { type Address } from "react-daum-postcode";
import { createClient } from "@/services/supabase/client";
import { formatPrice } from "@/utils/price";
import { useAuth } from "@/context/auth-context";
import Script from "next/script";
type PropertyForm = {
  title: string;
  address: string;
  subAddress?: string;
  zonecode?: string;
  type: string;
  totalFloor?: string;
  currentFloor?: string;
  description?: string;
  dealType?: string;
  managementFee?: string;
  noManagementFee?: boolean;
  includedItems?: string[];
  thumbnail?: File | null;
  detailImages?: File[];
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
  zonecode: "",
  type: "",
  totalFloor: "",
  currentFloor: "",
  description: "",
  dealType: "전세",
  managementFee: "",
  noManagementFee: false,
  includedItems: [],
  thumbnail: null,
  detailImages: [],
  price: "",
  deposit: "",
  data: "",
  firstPrice: 0,
  secondPrice: 0,
  choice: [],
};

const BUILDING_TYPES = ["아파트", "원룸", "빌라/투룸", "상가/사무실"];
const DEAL_TYPES = ["전세", "월세", "매매"];
const INCLUDED_ITEMS = ["전기", "가스", "수도", "인터넷", "TV", "청소비"];
const PROPERTY_IMAGES_BUCKET = "property-images";

function waitForKakaoServices(retries = 10, delayMs = 300): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.kakao?.maps?.services) {
      resolve(true);
      return;
    }

    if (retries <= 0) {
      resolve(false);
      return;
    }

    setTimeout(() => {
      waitForKakaoServices(retries - 1, delayMs).then(resolve);
    }, delayMs);
  });
}

async function getCoordsFromAddress(address: string) {
  const isReady = await waitForKakaoServices();

  if (!isReady) {
    console.log(
      "지오코딩 실패: 카카오 지도 SDK 로드 대기 시간 초과 (3초)",
    );
    return null;
  }

  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    // "(역삼동, OO빌딩)" 같은 괄호 부가정보는 지오코더가 못 알아듣는 경우가 많아서 떼고 검색
    const cleanAddress = address.replace(/\s*\([^)]*\)\s*$/, "").trim();

    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(cleanAddress, (result: any, status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve({
          lat: Number(result[0].y),
          lng: Number(result[0].x),
        });
      } else {
        console.log("지오코딩 실패:", status, cleanAddress);
        resolve(null);
      }
    });
  });
}

async function uploadPropertyImage(
  supabase: ReturnType<typeof createClient>,
  file: File,
  ownerId: string,
) {
  // Supabase Storage는 경로에 한글·공백 등이 있으면 400 "Invalid key"로 거부함
  // → 파일 이름은 버리고 UUID + 확장자만 사용
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  const filePath = `${ownerId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from(PROPERTY_IMAGES_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

// propertyId가 있으면 "수정 모드", 없으면 "등록 모드"
export default function Registration({
  propertyId,
}: {
  propertyId?: string;
}) {
  const isEdit = Boolean(propertyId);
  const router = useRouter();
  const user = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<PropertyForm>(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── 수정 모드 전용 상태 ──
  const [isLoading, setIsLoading] = useState(isEdit);
  // 이미 Storage에 올라가 있는 사진 주소 (새로 고른 File과 따로 관리)
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);
  const [existingDetailUrls, setExistingDetailUrls] = useState<string[]>([]);
  // 주소가 바뀌었을 때만 좌표를 다시 계산하기 위해 원래 주소 기억
  const [originalAddress, setOriginalAddress] = useState("");

  // 수정 모드: 이 id의 매물을 불러와서 폼에 채워 넣기
  useEffect(() => {
    if (!propertyId || !user) return;
    const supabase = createClient();

    supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .eq("owner_id", user.id) // 내 매물만 수정 가능
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setErrorMessage("매물을 찾을 수 없거나 수정 권한이 없어요.");
          setIsLoading(false);
          return;
        }

        // DB 컬럼(snake_case) → 폼 값(camelCase, 문자열)으로 옮겨 담기
        setForm({
          ...initialForm,
          title: data.title ?? "",
          address: data.address ?? "",
          subAddress: data.sub_address ?? "",
          zonecode: data.zonecode ?? "",
          type: data.building_type ?? "",
          totalFloor: data.total_floor?.toString() ?? "",
          currentFloor: data.current_floor?.toString() ?? "",
          description: data.description ?? "",
          dealType: data.deal_type ?? "전세",
          price: data.price?.toString() ?? "",
          managementFee: data.management_fee?.toString() ?? "",
          noManagementFee: data.no_management_fee ?? false,
          includedItems: data.included_items ?? [],
        });
        setExistingThumbnailUrl(data.thumbnail_url);
        setExistingDetailUrls(data.detail_image_urls ?? []);
        setOriginalAddress(data.address ?? "");
        setIsLoading(false);
      });
  }, [propertyId, user]);

  const [isAddressSearchOpen, setIsAddressSearchOpen] = useState(false);

  const handleComplete = (data: Address) => {
    // 도로명(R) / 지번(J) 중 사용자가 선택한 쪽
    let full =
      data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

    // 도로명일 때 법정동·건물명을 괄호로 덧붙임
    if (data.userSelectedType === "R") {
      const extra = [data.bname, data.buildingName].filter(Boolean).join(", ");
      if (extra) full += ` (${extra})`;
    }

    setForm((previous) => ({
      ...previous,
      address: full,
      zonecode: data.zonecode,
    }));
    setIsAddressSearchOpen(false);
  };

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSelectType(type: string) {
    setForm((previous) => ({
      ...previous,
      type,
    }));
  }

  function handleSelectDealType(dealType: string) {
    setForm((previous) => ({
      ...previous,
      dealType,
    }));
  }

  function handleToggleNoManagementFee() {
    setForm((previous) => ({
      ...previous,
      noManagementFee: !previous.noManagementFee,
      managementFee: previous.noManagementFee ? previous.managementFee : "0",
    }));
  }

  function handleToggleIncludedItem(item: string) {
    setForm((previous) => {
      const includedItems = previous.includedItems ?? [];
      const isIncluded = includedItems.includes(item);

      return {
        ...previous,
        includedItems: isIncluded
          ? includedItems.filter((includedItem) => includedItem !== item)
          : [...includedItems, item],
      };
    });
  }

  function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setForm((previous) => ({
      ...previous,
      thumbnail: file,
    }));

    event.target.value = "";
  }

  function handleDetailImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];

    setForm((previous) => ({
      ...previous,
      detailImages: [...(previous.detailImages ?? []), ...files],
    }));

    event.target.value = "";
  }

  function handleRemoveDetailImage(index: number) {
    setForm((previous) => ({
      ...previous,
      detailImages: (previous.detailImages ?? []).filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }));
  }

  // 새로 고른 사진이 있으면 그 미리보기, 없으면 (수정 모드) 기존 사진
  const thumbnailPreview = useMemo(
    () =>
      form.thumbnail
        ? URL.createObjectURL(form.thumbnail)
        : existingThumbnailUrl,
    [form.thumbnail, existingThumbnailUrl],
  );

  const detailImagePreviews = useMemo(
    () => (form.detailImages ?? []).map((file) => URL.createObjectURL(file)),
    [form.detailImages],
  );

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
    } else if (currentStep === 2 && !form.description?.trim()) {
      setErrorMessage("상세 설명 입력해 주세요.");
      return;
    }

    setCurrentStep((previous) => previous + 1);
  }

  function handlePrevious() {
    setErrorMessage("");
    setCurrentStep((previous) => previous - 1);
  }

  async function handleSave() {
    setErrorMessage("");

    if (!user) {
      setErrorMessage("로그인 후 이용해 주세요.");
      return;
    }

    setIsSaving(true);

    const supabase = createClient();

    try {
      // 새 사진을 안 골랐으면 기존 사진 유지 (등록 모드에서는 null)
      let thumbnailUrl: string | null = existingThumbnailUrl;
      if (form.thumbnail) {
        thumbnailUrl = await uploadPropertyImage(
          supabase,
          form.thumbnail,
          user.id,
        );
      }

      // 남겨 둔 기존 사진 + 새로 올린 사진
      const detailImageUrls: string[] = [...existingDetailUrls];
      for (const file of form.detailImages ?? []) {
        const url = await uploadPropertyImage(supabase, file, user.id);
        detailImageUrls.push(url);
      }

      const values = {
        address: form.address,
        sub_address: form.subAddress || null,
        zonecode: form.zonecode || null,
        building_type: form.type,
        total_floor: form.totalFloor ? Number(form.totalFloor) : null,
        current_floor: form.currentFloor ? Number(form.currentFloor) : null,
        title: form.title,
        description: form.description || null,
        thumbnail_url: thumbnailUrl,
        detail_image_urls: detailImageUrls,
        deal_type: form.dealType || null,
        price: form.price ? Number(form.price) : null,
        management_fee: form.managementFee ? Number(form.managementFee) : null,
        no_management_fee: form.noManagementFee ?? false,
        included_items: form.includedItems ?? [],
      };

      // 좌표: 새로 등록하거나, 수정 모드에서 주소가 바뀐 경우에만 다시 계산
      // (주소가 그대로면 latitude/longitude를 보내지 않아서 기존 값이 유지됨)
      const addressChanged = !isEdit || form.address !== originalAddress;
      const coordValues: { latitude?: number | null; longitude?: number | null } =
        {};
      if (addressChanged) {
        const coords = await getCoordsFromAddress(form.address);
        coordValues.latitude = coords?.lat ?? null;
        coordValues.longitude = coords?.lng ?? null;
      }

      const { error } = isEdit
        ? await supabase
            .from("properties")
            .update({
              ...values,
              ...coordValues,
              updated_at: new Date().toISOString(),
            })
            .eq("id", propertyId!)
            .eq("owner_id", user.id)
        : await supabase
            .from("properties")
            .insert({ ...values, ...coordValues, owner_id: user.id });

      if (error) {
        throw error;
      }

      alert(isEdit ? "매물이 수정되었습니다." : "매물이 등록되었습니다.");
      router.push("/join");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(`저장 중 오류가 발생했습니다: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Script
        strategy="afterInteractive"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        onLoad={() => {
          console.log(
            "카카오 SDK 키 설정 여부:",
            Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY),
          );
          console.log("카카오 스크립트 onLoad 실행됨, window.kakao:", window.kakao);
          window.kakao?.maps?.load(() => {
            console.log(
              "kakao.maps.load 완료, services 존재?",
              Boolean(window.kakao?.maps?.services),
            );
          });
        }}
        onError={(e) => {
          console.log("카카오 스크립트 로드 자체가 실패함:", e);
        }}
      />
      <div className=" px-10  py-4 max-w-[80.63rem] m-auto mt-5 min-h-[calc(100vh_-_219px)]" >
        <h2 className="text-4xl text-[#002045] block pb-5 font-bold">
          {isEdit
            ? "매물 수정 (Edit Property)"
            : "매물 등록 (Property Registration)"}
        </h2>
        <p className="text-base text-[#43474E]">
          정확한 정보를 입력하여 높은 Safe Score를 획득하세요.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {isLoading && (
          <p className="mt-8 rounded-xl border px-10 py-10 text-center text-sm text-gray-400">
            매물 정보를 불러오는 중...
          </p>
        )}
        {/* Step 1 */}
        {!isLoading && currentStep === 1 && (
          <section className="mt-8 rounded-xl border  px-10  py-4 max-w-[80.63rem] m-auto">
            <div className="flex gap-3 rounded-lg bg-blue-50 p-4 text-blue-900">
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                i
              </span>
              <div>
                <p className="font-semibold">정확한 정보 입력의 중요성</p>
                <p className="mt-1 text-sm">
                  정확한 주소와 건물 정보를 입력하시면 SafeScore 심사 시
                  유리하게 작용하여 매물의 신뢰도를 높일 수 있습니다.
                </p>
              </div>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-sm font-medium">매물 주소</span>
              <div className="flex gap-2">
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="도로명 주소 입력"
                  className="flex-1 rounded-md border px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => setIsAddressSearchOpen(true)}
                  className="rounded-md border px-4 py-2 text-sm font-medium"
                >
                  주소 검색
                </button>
              </div>
            </label>

            {isAddressSearchOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={() => setIsAddressSearchOpen(false)}
              >
                <div
                  className="w-full max-w-md rounded-xl bg-white p-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">주소 검색</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddressSearchOpen(false)}
                      className="text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <DaumPostcodeEmbed
                    onComplete={handleComplete}
                    autoClose={false}
                    style={{ height: 450 }}
                  />
                </div>
              </div>
            )}

            <label className="mt-3 grid gap-2">
              <input
                name="subAddress"
                value={form.subAddress}
                onChange={handleChange}
                placeholder="상세 주소 (동, 호수)"
                className="rounded-md border px-3 py-2"
              />
            </label>

            <div className="mt-5">
              <span className="text-sm font-medium">건물 유형</span>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BUILDING_TYPES.map((buildingType) => (
                  <button
                    key={buildingType}
                    type="button"
                    onClick={() => handleSelectType(buildingType)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      form.type === buildingType
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {buildingType}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        {/* Step 2 */}
        {currentStep === 2 && (
          <section className="mt-8 rounded-xl border  px-10  py-4 max-w-[80.63rem] m-auto">
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                매물 제목 <span className="text-red-500">*</span>
              </span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="예: 채광 좋은 남향 3룸 아파트"
                className="rounded-md border px-3 py-2"
              />
              <span className="text-xs text-gray-500">
                목록에 표시될 간략한 특징을 적어주세요.
              </span>
            </label>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-medium">
                상세 설명 <span className="text-red-500">*</span>
              </span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="교통편, 주변 시설, 리모델링 여부 등 상세한 정보를 입력해 주세요."
                rows={5}
                className="rounded-md border px-3 py-2"
              />
            </label>

            <div className="mt-6">
              <span className="text-sm font-medium">
                썸네일 이미지 <span className="text-red-500">*</span>
              </span>
              <p className="mt-1 text-xs text-gray-500">
                목록에서 대표로 보여질 이미지를 등록해주세요.
              </p>
              <label className="mt-2 flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed text-gray-400 hover:border-blue-400">
                {thumbnailPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus className="h-6 w-6" />
                    이미지 등록
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-6">
              <span className="text-sm font-medium">상세 이미지</span>
              <p className="mt-1 text-xs text-gray-500">
                매물의 실내외 사진을 여러 장 등록해주세요.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {/* (수정 모드) 이미 올라가 있는 사진: X로 빼면 저장할 때 목록에서 제외 */}
                {existingDetailUrls.map((src, index) => (
                  <div
                    key={src}
                    className="relative h-24 overflow-hidden rounded-lg border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`기존 상세 이미지 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExistingDetailUrls((previous) =>
                          previous.filter((url) => url !== src),
                        )
                      }
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {detailImagePreviews.map((src, index) => (
                  <div
                    key={src}
                    className="relative h-24 overflow-hidden rounded-lg border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`상세 이미지 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDetailImage(index)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs text-gray-400 hover:border-blue-400">
                  <ImagePlus className="h-5 w-5" />
                  추가
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDetailImagesChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>
        )}
        {/* Step 3 */}
        {currentStep === 3 && (
          <section className="mt-8 rounded-xl border  px-10  py-4 max-w-[80.63rem] m-auto">
            <div>
              <span className="text-sm font-medium">거래 종류</span>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {DEAL_TYPES.map((dealType) => (
                  <button
                    key={dealType}
                    type="button"
                    onClick={() => handleSelectDealType(dealType)}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      form.dealType === dealType
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {dealType}
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-6 grid gap-2">
              <span className="text-sm font-medium">보증금 / 매매가</span>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full rounded-md border px-3 py-2 pr-12 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  원
                </span>
              </div>
              {/* 입력한 숫자를 "7억 8,000만원"처럼 바로 보여줘서 0 개수 실수 방지 */}
              {form.price && (
                <span className="text-right text-sm font-medium text-[#002045]">
                  {formatPrice(Number(form.price))}
                </span>
              )}
            </label>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">관리비</span>
                <label className="flex items-center gap-1.5 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.noManagementFee}
                    onChange={handleToggleNoManagementFee}
                    className="rounded border"
                  />
                  관리비 없음
                </label>
              </div>
              <div className="relative mt-2">
                <input
                  name="managementFee"
                  type="number"
                  value={form.managementFee}
                  onChange={handleChange}
                  disabled={form.noManagementFee}
                  placeholder="0"
                  className="w-full rounded-md border px-3 py-2 pr-12 text-right disabled:bg-gray-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  만원
                </span>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-sm font-medium">관리비 포함 항목</span>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INCLUDED_ITEMS.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.includedItems?.includes(item) ?? false}
                      onChange={() => handleToggleIncludedItem(item)}
                      className="rounded border"
                    />
                    {item}
                  </label>
                ))}
              </div>
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
              disabled={isSaving || isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isEdit
                ? isSaving
                  ? "수정 중..."
                  : "수정하기"
                : isSaving
                  ? "저장 중..."
                  : "임시저장"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
