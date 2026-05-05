
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
  schemaData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "Sora Sushi is a contemporary Japanese dining experience featuring seasonal omakase, elegant interiors, and traditional techniques with a modern twist.",
  canonical = "https://sora-sushi.com",
  ogType = "website",
  ogImage = "https://sora-sushi.com/og-image.jpg",
  twitterHandle = "@sorasushi",
  schemaData
}) => {
  const siteTitle = "Sora Sushi | Contemporary Omakase";
  const fullTitle = title ? `${title} | Sora Sushi` : siteTitle;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Sora Sushi" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Language Alternates if applicable */}
      <html lang="en" />

      {/* Structured Data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
