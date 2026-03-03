import { promises as fs } from "fs";
import path from "path";
import Container from "@/components/layout/Container";
import AboutContent from "@/components/about/AboutContent";
import { AboutData } from "@/types/types";

const AboutPage = async () => {
  const filePath = path.join(process.cwd(), "public/data/about.json");
  const file = await fs.readFile(filePath, "utf8");
  const data: AboutData = JSON.parse(file);

  return (
    <Container className="py-16">
      <AboutContent data={data} />
    </Container>
  );
};

export default AboutPage;
