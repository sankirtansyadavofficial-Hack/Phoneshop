import { cn } from "@/lib/utils";

export function RobotFlyby({ className }: { className?: string }) {
  return (
    <div className={cn("w-full py-16 md:py-24 flex flex-col items-center justify-center bg-black overflow-hidden relative", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />
      
      <div className="max-w-5xl w-full px-6 mb-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
          The Cyber Assistant Matrix
        </h2>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          OmniHub is powered by a high-speed cybernetic backbone. Rotate, hover, and interact with the digital core model below.
        </p>
      </div>

      <div className="w-full h-[500px] md:h-[650px] max-w-5xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-black/40 backdrop-blur-xl">
        <iframe
          src="https://my.spline.design/untitled-rv0hx3zVdoM6t2ydngxuS7zi/"
          className="w-full h-full"
          style={{ border: "none" }}
          allowFullScreen
          title="Spline 3D Robot Scene"
        />
      </div>
    </div>
  );
}

export const Component = RobotFlyby;
