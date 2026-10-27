import Chapters from "@/components/Chapters";
import Experience from "@/components/Experience";
import { chapters } from "@/content/site";

export default function Page() {
  return (
    <Experience chapters={chapters}>
      <Chapters />
    </Experience>
  );
}
