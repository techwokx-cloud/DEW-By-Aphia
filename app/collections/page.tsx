import { redirect } from "next/navigation";

// Collections is now LookBook — every "Collections" link in the app
// points to /lookbook directly, but this redirect covers old bookmarks,
// external links, and search engine results still pointing here.
export default function CollectionsRedirect() {
  redirect("/lookbook");
}
