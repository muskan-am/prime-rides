import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
} from "lucide-react";

export default function SearchBox() {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl border bg-background p-4 shadow-lg sm:p-6">
      
      {/* Rental Type */}
      <div className="mb-5">
        <label
          htmlFor="rental-type"
          className="mb-2 block text-sm font-medium"
        >
          Rental Type
        </label>

        <select
          id="rental-type"
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue="self-drive"
        >
          <option value="self-drive">Self-Drive Rental</option>
          <option value="monthly">Monthly Rental</option>
        </select>
      </div>

      {/* Location Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Pickup Location */}
        <div>
          <label
            htmlFor="pickup-location"
            className="mb-2 block text-sm font-medium"
          >
            Pickup Location
          </label>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <select
              id="pickup-location"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>
                Select pickup location
              </option>
              <option value="delhi">Delhi</option>
              <option value="goa">Goa</option>
              <option value="bangalore">Bangalore</option>
            </select>
          </div>
        </div>

        {/* Return Location */}
        <div>
          <label
            htmlFor="return-location"
            className="mb-2 block text-sm font-medium"
          >
            Return Location
          </label>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <select
              id="return-location"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>
                Select return location
              </option>
              <option value="delhi">Delhi</option>
              <option value="goa">Goa</option>
              <option value="bangalore">Bangalore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Pickup Date */}
        <div>
          <label
            htmlFor="pickup-date"
            className="mb-2 block text-sm font-medium"
          >
            Pickup Date
          </label>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <input
              id="pickup-date"
              type="date"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Pickup Time */}
        <div>
          <label
            htmlFor="pickup-time"
            className="mb-2 block text-sm font-medium"
          >
            Pickup Time
          </label>

          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <input
              id="pickup-time"
              type="time"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Return Date */}
        <div>
          <label
            htmlFor="return-date"
            className="mb-2 block text-sm font-medium"
          >
            Return Date
          </label>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <input
              id="return-date"
              type="date"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Return Time */}
        <div>
          <label
            htmlFor="return-time"
            className="mb-2 block text-sm font-medium"
          >
            Return Time
          </label>

          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <input
              id="return-time"
              type="time"
              className="h-11 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-5">
        <Button
          type="button"
          size="lg"
          className="w-full gap-2"
        >
          <Search className="h-5 w-5" />
          Search Available Cars
        </Button>
      </div>
    </div>
  );
}