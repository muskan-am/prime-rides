export interface FilterSectionConfig {
  enabled: boolean;
  label?: string;
  [key: string]: any;
}

export interface FilterSettings {
  priceRange: {
    enabled: boolean;
    label: string;
    minPrice: number;
    maxPrice: number;
    step: number;
  };
  carType: {
    enabled: boolean;
    label: string;
    subLabel: string;
    options: string[];
  };
  fuelType: {
    enabled: boolean;
    label: string;
    options: string[];
  };
  transmission: {
    enabled: boolean;
    label: string;
    options: string[];
  };
  seats: {
    enabled: boolean;
    label: string;
    options: string[];
  };
  userRatings: {
    enabled: boolean;
    label: string;
    options: { label: string; minRating: number }[];
  };
  deliveryType: {
    enabled: boolean;
    label: string;
    homeDeliveryEnabled: boolean;
    noticeText: string;
  };
  // Optional legacy fields for backward-compatibility
  distance?: {
    enabled: boolean;
    label: string;
    maxKm: number;
    defaultKm: number;
  };
  modelYear?: {
    enabled: boolean;
    label: string;
    minYear: number;
    options: string[];
  };
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  priceRange: {
    enabled: true,
    label: "Price Range",
    minPrice: 500,
    maxPrice: 15000,
    step: 100,
  },
  carType: {
    enabled: true,
    label: "Car Type",
    subLabel: "Filter By Category",
    options: [
      "SUV",
      "Sedan",
      "Hatchback",
      "MUV/MPV",
      "Luxury Sedan",
      "Compact SUV",
      "Luxury SUV",
    ],
  },
  fuelType: {
    enabled: true,
    label: "Fuel Type",
    options: ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"],
  },
  transmission: {
    enabled: true,
    label: "Transmission",
    options: ["Automatic", "Manual"],
  },
  seats: {
    enabled: true,
    label: "Seats",
    options: ["4/5 Seater", "6/7 Seater"],
  },
  userRatings: {
    enabled: true,
    label: "User Ratings",
    options: [
      { label: "4.5+ Rated", minRating: 4.5 },
      { label: "4.2+ Rated", minRating: 4.2 },
      { label: "4.0+ Rated", minRating: 4.0 },
      { label: "3.5+ Rated", minRating: 3.5 },
      { label: "All", minRating: 0 },
    ],
  },
  deliveryType: {
    enabled: true,
    label: "Delivery Option",
    homeDeliveryEnabled: true,
    noticeText: "Delivery available across hub locations",
  },
};
