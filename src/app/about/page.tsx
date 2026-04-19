import { promises as fs } from "fs";
import path from "path";
import AboutContent from "@/components/about/AboutContent";
import { AboutData } from "@/types/types";

const AboutPage = async () => {
  const filePath = path.join(process.cwd(), "public/data/about.json");
  const file = await fs.readFile(filePath, "utf8");
  const data: AboutData = JSON.parse(file);

  return (
    <div style={{ background: "var(--background)" }} className="min-h-screen">
      {/* Aurora bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, #C08552 0%, #8C5A3C 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:pl-20">
        <AboutContent data={data} />
      </div>
    </div>
  );
};

export default AboutPage;
