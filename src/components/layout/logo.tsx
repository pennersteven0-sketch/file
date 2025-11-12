import Link from "next/link";
import { HardHat } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <HardHat className="h-6 w-6 text-primary" />
      <span className="text-lg">ConexPro</span>
    </Link>
  );
}
