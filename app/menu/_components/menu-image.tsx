import Image from "next/image";

type MenuImageProps = {
  src: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
  preload?: boolean;
  sizes?: string;
};

export function MenuImage({
  src,
  alt,
  className,
  imageClassName,
  preload = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: MenuImageProps) {
  const wrapperClassName = [
    "relative overflow-hidden bg-stone-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!src) {
    return (
      <div className={wrapperClassName}>
        <div className="flex h-full w-full items-center justify-center bg-stone-200 text-sm font-medium text-stone-500">
          {alt}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <Image
        src={src}
        alt={alt}
        fill
        preload={preload}
        sizes={sizes}
        className={["object-cover", imageClassName].filter(Boolean).join(" ")}
      />
    </div>
  );
}
