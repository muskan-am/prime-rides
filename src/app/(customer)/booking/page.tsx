import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ car?: string }>;
};

export default async function CustomerBookingPage({ searchParams }: PageProps) {
  const { car } = await searchParams;

  if (car) {
    redirect(`/booking/${car}`);
  }

  redirect("/cars");
}