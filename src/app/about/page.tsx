import { promises as fs } from "fs";
import path from "path";
import AboutContent from "@/components/about/AboutContent";
import ContactBand from "@/components/home/ContactBand";
import { AboutData } from "@/types/types";

const AboutPage = async () => {
  const filePath = path.join(process.cwd(), "public/data/about.json");
  const file = await fs.readFile(filePath, "utf8");
  const data: AboutData = JSON.parse(file);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AboutContent data={data} />
      <ContactBand />
    </div>
  );
};

export default AboutPage;
