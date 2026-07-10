import { redirect } from "next/navigation";

export default function Home() {
  redirect("/menu?tableId=1");
}
