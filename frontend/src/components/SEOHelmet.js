import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Helmet Component
 * Manages meta tags, structured data, and SEO optimization
 */
const SEOHelmet = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl,
  ogImage,
  schema,
  additionalMeta = []
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://coorgmasala.com';
  const defaultImage = `${siteUrl}/images/coorg-spices-og.jpg`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={`${siteUrl}${canonicalUrl}`} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${siteUrl}${canonicalUrl || ''}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:site_name" content="Coorg Masala & Coffee" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`${siteUrl}${canonicalUrl || ''}`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="IN-KA" />
      <meta name="geo.placename" content="Coorg, Karnataka" />
      <meta name="geo.position" content="12.4244;75.7382" />
      <meta name="ICBM" content="12.4244, 75.7382" />
      
      {/* Language and Robots */}
      <meta name="language" content="English" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
      
      {/* Structured Data / Schema.org */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHelmet;
