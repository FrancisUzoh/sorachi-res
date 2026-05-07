
export const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Sora Sushi",
  "image": "https://sora-sushi.com/og-image.jpg",
  "@id": "https://sora-sushi.com",
  "url": "https://sora-sushi.com",
  "telephone": "+442079460123",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "42 Loampit Vale, Lewisham",
    "addressLocality": "London",
    "postalCode": "SE13 7SN",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.4646,
    "longitude": -0.0154
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "12:00",
      "closes": "23:00"
    }
  ],
  "menu": "https://sora-sushi.com/menu",
  "servesCuisine": "Japanese, Sushi, Omakase",
  "priceRange": "$$$$"
};

export const defaultSEO = {
  description: "Experience contemporary Japanese dining at Sora Sushi. Seasonal omakase, premium nigiri, and an elegant atmosphere in the heart of London.",
  ogImage: "https://sora-sushi.com/og-image.jpg"
};
