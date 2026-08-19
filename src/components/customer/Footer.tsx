import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-8 md:grid-cols-4">

          <div>
            <Link href="/" className="text-xl font-bold">
              Prime<span className="text-muted-foreground">Rides</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Simple, reliable and convenient self-drive car rentals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Explore</h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/cars">Cars</Link>
              <Link href="/locations">Locations</Link>
              <Link href="/monthly-rentals">
                Monthly Rentals
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Customer</h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard">My Bookings</Link>
              <Link href="/dashboard/profile">My Profile</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Prime Rides</h3>

            <p className="mt-3 text-sm text-muted-foreground">
              Delhi · Goa · Bangalore
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              © {new Date().getFullYear()} Prime Rides.
            </p>
          </div>

        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          All rights reserved.
        </div>

      </div>
    </footer>
  );
}