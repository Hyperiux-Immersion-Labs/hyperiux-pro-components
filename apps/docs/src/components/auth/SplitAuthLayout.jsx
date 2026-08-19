import CubeBackgroundAscii from "../../homepage-v3/components/CubeBackgroundAscii";

export default function SplitAuthLayout({ children, artSrc }) {
  return (
    <main className="flex min-h-screen w-full justify-end text-white">
      <div className="h-screen w-full fixed inset-0 -translate-x-1/2">
                    <CubeBackgroundAscii />

      </div>

      <div className="flex items-center justify-center px-36 py-20 w-1/2">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
