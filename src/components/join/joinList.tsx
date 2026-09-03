"use client";
import { useState } from "react";
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

type ListingStatus = "review" | "published" | "private";

type Listing = {
  id: number;
  title: string;
  address: string;
  price: string;
  status: ListingStatus;
};

const STATS = [
  {
    label: "전체 매물",
    value: 12,
    valueClassName: "text-[#002045]",
    cardClassName: "bg-white",
  },
  {
    label: "리뷰 등록",
    value: 3,
    valueClassName: "text-amber-500",
    cardClassName: "bg-amber-50",
  },
  {
    label: "승인 완료",
    value: 8,
    valueClassName: "text-green-600",
    cardClassName: "bg-green-50",
  },
  {
    label: "거부된 매물",
    value: 1,
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
  const [activeFilter, setActiveFilter] = useState<"all" | ListingStatus>(
    "all",
  );
  const [keyword, setKeyword] = useState("");

  const filteredListings = LISTINGS.filter((listing) => {
    const matchesFilter =
      activeFilter === "all" || listing.status === activeFilter;
    const matchesKeyword =
      !keyword.trim() ||
      listing.title.toLowerCase().includes(keyword.trim().toLowerCase()) ||
      listing.address.toLowerCase().includes(keyword.trim().toLowerCase());

    return matchesFilter && matchesKeyword;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
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
              {stat.value}
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
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="overflow-hidden rounded-xl border bg-white"
          >
            <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300">
              {listing.status === "published" && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
              {listing.status === "review" && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  Under Review
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-[#002045]">{listing.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {listing.address}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-[#002045]">
                  {listing.price}
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
