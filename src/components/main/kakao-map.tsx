import Link from "next/link";
import type { RoomList } from "@/types/property";
export default function KakaoMap({ roomList }: { roomList: RoomList }) {
  return (
    <div className="bg-[#f8f9ff]">
      <ul className="flex max-w-[80.63rem] m-auto px-5 pt-5 pb-10 gap-6">
        <li className="flex-1">
          <img src="/map.png" alt="" />
        </li>
        <li className="flex-1">
          <div className="flex items-center justify-between pb-6">
            <p>총 24개</p>
            <div>
              <button>
                <img src="/solt.svg" alt="" />
              </button>
              <div className="hidden">{/* solt 메뉴 */}</div>
            </div>
          </div>
          <ul className="flex flex-col gap-6 h-[36.88rem] overflow-hidden">
            {roomList.map((item, index) => (
              <li key={index}>
                <Link href="/">
                  <div className="flex font-card gap-4">
                    <img src={item.img} alt="" />
                    <div className="card-info">
                      <div className="label-card2  text-[#fff]">
                        <img src="/card_label2.svg" alt="" />
                        {item.label}
                      </div>
                      <p>
                        <span>{item.price}</span>
                      </p>
                      <strong>{item.description}</strong>
                      <p>score : {item.score}</p>
                    </div>
                    <button>{}</button>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
