import { redirect } from "next/navigation";

// Consultation booking now lives inside the Custom Made page (the
// consultation form and the custom-order journey are the same flow) —
// this redirect covers old bookmarks, external links, and search engine
// results still pointing here.
export default function ConsultationRedirect() {
  redirect("/custom-design#book");
}
