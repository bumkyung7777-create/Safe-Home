"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { createClient } from "@/services/supabase/client";
import { useAuth } from "@/context/auth-context";
import type { PropertyRecord } from "@/types/property";
import { formatPrice } from "@/utils/price";

type ListingStatus = "review" | "published" | "private";

type Listing = {
  id: number;
  title: string;
  address: string;
  price: string;
  status: ListingStatus;
};

type StatKey = "total" | "review" | "published" | "rejected";

// 카드 모양만 정의하고, 숫자는 컴포넌트 안의 statCounts에서 key로 꺼내 씀
const STATS: {
  key: StatKey;
  label: string;
  valueClassName: string;
  cardClassName: string;
}[] = [
  {
    key: "total",
    label: "전체 매물",
    valueClassName: "text-[#002045]",
    cardClassName: "bg-white",
  },
  {
    key: "review",
    label: "리뷰 등록",
    valueClassName: "text-amber-500",
    cardClassName: "bg-amber-50",
  },
  {
    key: "published",
    label: "승인 완료",
    valueClassName: "text-green-600",
    cardClassName: "bg-green-50",
  },
  {
    key: "rejected",
    label: "거부된 매물",
    valueClassName: "text-red-600",
    cardClassName: "bg-white",
  },
];

const FILTERS: { label: string; value: "all" | ListingStatus }[] = [
  { label: "전체", value: "all" },
  { label: "리뷰등록", value: "review" },
  { label: "승인 완료", value: "published" },
  { label: "비공개", value: "private" },
];

const LISTINGS: Listing[] = [
  {
    id: 1,
    title: "Gangnam Acrotel Unit 1204",
    address: "123 Teheran-ro, Gangnam-gu, Seoul",
    price: "₩ 1.2B",
    status: "published",
  },
  {
    id: 2,
    title: "Mapo Riverview Villa 302",
    address: "45 Mapo-daero, Mapo-gu, Seoul",
    price: "₩ 850M",
    status: "review",
  },
];

export default function JoinList() {
  const supabase = createClient();
  const user = useAuth();
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | ListingStatus>(
    "all",
  );
  const [keyword, setKeyword] = useState("");

  const getProducts = async (ownerId: string) => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", ownerId);

    if (data) {
      console.log("properties data:", data);
      setProperties(data);
    }
  };

  useEffect(() => {
    if (user) {
      getProducts(user.id);
    }
  }, [user]);

  // 전체 매물 = 내가 등록한 매물 수 (DB에서 불러온 properties 길이)
  // TODO: 리뷰 등록 / 승인 완료 / 거부된 매물은 서비스 로직 만든 뒤 계산으로 교체
  const statCounts: Record<StatKey, number> = {
    total: properties.length,
    review: 0,
    published: 0,
    rejected: 0,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 min-h-[calc(100vh_-_199px)]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002045]">나의 매물</h1>
          <p className="mt-1 text-sm text-gray-500">
            등록된 매물 리스트 와 상태관리를 확인할 수 있습니다.
          </p>
        </div>

        <Link
          href="/join/registration"
          className="flex items-center gap-2 rounded-full bg-[#002045] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          매물등록
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 ${stat.cardClassName}`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-2 text-2xl font-bold ${stat.valueClassName}`}>
              {statCounts[stat.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="매물 제목 또는 주소 검색"
            className="w-full rounded-full border py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeFilter === filter.value
                  ? "border-[#002045] bg-[#002045] text-white"
                  : "text-gray-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((listing) => (
          <div
            key={listing.id}
            className="overflow-hidden rounded-xl border bg-white"
          >
            <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300">
              {listing.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.thumbnail_url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-[#002045]">{listing.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-black-300">
                {listing.description}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                {listing.address}
                <br />
                {listing.sub_address}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-[#002045]">
                  {formatPrice(listing.price)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full border text-gray-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#002045] text-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
