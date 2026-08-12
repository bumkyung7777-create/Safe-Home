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
