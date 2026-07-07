import Image from "next/image";

export function AppHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-4">
      <div className="pointer-events-auto flex w-full max-w-lg items-center justify-center rounded-2xl border border-white/50 bg-white/75 px-6 py-3 shadow-sm backdrop-blur-md">
        <Image
          src="/images/logo-transporte-apoquindo.png"
          alt="Transportes Apoquindo"
          width={220}
          height={48}
          className="h-8 w-auto object-contain md:h-10"
          priority
        />
      </div>
    </header>
  );
}
