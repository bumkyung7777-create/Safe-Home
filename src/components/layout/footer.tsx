import Link from "next/link";
export default function Footer() {
  return (
    <footer>
      <div className=" py-8  px-10   max-w-[80.63rem] m-auto">
        <Link href="/">
          <img src="/bottomLogo.svg" alt="Logo" />
        </Link>
        <div className="flex  flex items-center opacity-80 pt-4 text-xs justify-between">
          <div>
            <p className="text-[#ffffff] text-[14px]">
              © 2024 SafeHome Institutional Real Estate. All rights reserved.
              <br />
              Verified status is subject to HUG/HF audit.
            </p>
          </div>
          <ul className="flex gap-6 text-[#ffffff] text-[12px] ml-10">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Institutional Terms</Link>
            </li>
            <li>
              <Link href="/contact">Contact Support</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
