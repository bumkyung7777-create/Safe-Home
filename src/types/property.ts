// property.ts
export type Room = {
  label: string;
  name: string;
  price: string;
  description: string;
  img: string;
};

export type RoomWithMeta = Room & {
  like: boolean;
  score: number;
};

export type RoomList = RoomWithMeta[];

export type PropertyProps = {
  roomType: Room[];
};

// supabase-properties-table.sql 의 public.properties 테이블과 1:1로 맞춘 타입
// supabase.from("properties").select("*") 결과 한 줄(row)의 모양
export type PropertyStatus = "review" | "published" | "private";

export type PropertyRecord = {
  id: string;
  owner_id: string;
  address: string;
  sub_address: string | null;
  zonecode: string | null;
  latitude: number | null;
  longitude: number | null;
  building_type: string;
  total_floor: number | null;
  current_floor: number | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  detail_image_urls: string[];
  deal_type: string | null;
  price: number | null;
  management_fee: number | null;
  no_management_fee: boolean;
  included_items: string[];
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
};
