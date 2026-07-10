import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { MenuItemDTO } from "@/lib/menu-types";
import { MenuImage } from "./menu-image";

type MenuCardProps = {
  item: MenuItemDTO;
  tableId: number;
};

export function MenuCard({ item, tableId }: MenuCardProps) {
  return (
    <Link
      href={`/menu/item/${item.id}?tableId=${tableId}`}
      className="group rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
    >
      <MenuImage
        src={item.imageUrl}
        alt={item.name}
        className="aspect-[4/3] rounded-t-lg"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-6 text-stone-950 group-hover:text-red-700">
            {item.name}
          </h3>
          <p className="shrink-0 text-sm font-semibold text-red-700">
            {formatVnd(item.price)}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
          {item.description}
        </p>
      </div>
    </Link>
  );
}
