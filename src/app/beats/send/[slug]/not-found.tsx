import Link from "next/link";
import { T } from "@/components/LocaleProvider";
export default function CollectionNotFound() {
  return <section className="mx-auto max-w-3xl px-5 py-28 text-center"><h1 className="text-3xl font-bold"><T>Selection unavailable</T></h1><p className="mt-4 text-black/50"><T>This link is not published or is no longer available.</T></p><Link href="/beats" className="portfolio-button mt-8 bg-black text-white"><T>Explore beats</T></Link></section>;
}
