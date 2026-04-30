// SEO Configuration for Coorg Masala & Coffee
// Optimized for Indian Spices, Organic Coffee, and International Exports

export const seoConfig = {
  // Global SEO Settings
  siteName: "Coorg Masala & Coffee",
  siteUrl: "https://coorgmasala.com",
  defaultLanguage: "en",
  
  // Primary Keywords
  primaryKeywords: [
    "Indian spices",
    "organic spices India",
    "premium Coorg spices",
    "Coorg masala",
    "Indian coffee",
    "organic coffee India",
    "export Indian spices",
    "spices exporter India",
    "authentic Indian spices",
    "Coorg coffee beans"
  ],

  // Target Markets
  targetMarkets: {
    germany: {
      keywords: ["Indian spices Germany", "export spices to Germany", "authentic Indian masala Germany"],
      language: "de"
    },
    europe: {
      keywords: ["Indian spices Europe", "organic spices Europe", "premium Indian coffee Europe"],
      language: "en"
    },
    usa: {
      keywords: ["Indian spices USA", "authentic Coorg spices America", "organic Indian coffee US"],
      language: "en"
    },
    dubai: {
      keywords: ["Indian spices Dubai", "premium spices UAE", "Coorg coffee Dubai"],
      language: "en"
    },
    global: {
      keywords: ["international spice exporter", "global spice supplier", "worldwide Indian spices"],
      language: "en"
    }
  },

  // Page-specific SEO
  pages: {
    home: {
      title: "Premium Coorg Spices & Coffee | Organic Indian Spices Exporter | Coorg Masala",
      description: "Export premium organic Indian spices and authentic Coorg coffee worldwide. Trusted supplier to Germany, Europe, USA, Dubai & global markets. 100% organic, premium quality Coorg masala and spices.",
      keywords: "organic Indian spices, Coorg coffee, premium spices exporter, Indian masala, authentic spices, organic coffee India, export spices Germany, spices USA, spices Dubai",
      schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Coorg Masala & Coffee",
        "description": "Premium organic Indian spices and coffee exporter",
        "url": "https://coorgmasala.com",
        "logo": "https://coorgmasala.com/logo.png",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressRegion": "Karnataka",
          "addressLocality": "Coorg"
        },
        "areaServed": ["Germany", "Europe", "United States", "Dubai", "UAE", "Worldwide"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Organic Spices and Coffee",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Organic Indian Spices"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Premium Coorg Coffee"
              }
            }
          ]
        }
      }
    },
    
    products: {
      title: "Premium Organic Spices & Coffee | Authentic Coorg Products",
      description: "Browse our collection of premium organic Indian spices and authentic Coorg coffee. Cardamom, black pepper, turmeric, cinnamon, ginger & more. Export quality products.",
      keywords: "organic cardamom, black pepper India, turmeric powder, Coorg coffee beans, premium cinnamon, organic ginger, Indian spices online",
      schema: {
        "@context": "https://schema.org",
        "@type": "ProductCollection",
        "name": "Premium Organic Spices and Coffee"
      }
    },

    export: {
      title: "Export Indian Spices & Coffee | International Shipping to Germany, USA, Dubai, Europe",
      description: "Leading exporter of premium organic Indian spices and Coorg coffee to Germany, Europe, USA, Dubai & worldwide. Bulk orders, wholesale pricing, certified organic products.",
      keywords: "export Indian spices, spices exporter Germany, bulk spices USA, wholesale Indian spices, organic spices export, Coorg coffee export, international spice supplier",
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "International Spice Export Service",
        "provider": {
          "@type": "Organization",
          "name": "Coorg Masala & Coffee"
        },
        "areaServed": ["DE", "EU", "US", "AE", "Worldwide"],
        "serviceType": "Export and International Shipping"
      }
    },

    about: {
      title: "About Us | Premium Coorg Spices & Coffee Exporter from India",
      description: "Learn about our journey in exporting premium organic spices and authentic Coorg coffee. Family-owned business committed to quality, sustainability, and authentic Indian flavors.",
      keywords: "Coorg spices supplier, Indian spice company, organic coffee producer, sustainable spices, authentic Indian masala"
    },

    contact: {
      title: "Contact Us | Order Premium Indian Spices & Coffee for Export",
      description: "Get in touch for bulk orders, wholesale pricing, and international shipping. Export premium organic Coorg spices and coffee to Germany, USA, Dubai, Europe & worldwide.",
      keywords: "order Indian spices, bulk spice orders, wholesale spices, export inquiry, international shipping spices"
    }
  },

  // Product-specific SEO
  products: {
    cardamom: {
      title: "Organic Green Cardamom | Premium Coorg Cardamom for Export",
      description: "Premium organic green cardamom from Coorg, India. Export quality, rich aroma, authentic flavor. Available for international shipping to Germany, USA, Dubai, Europe.",
      keywords: "organic cardamom, green cardamom India, Coorg cardamom, export cardamom, premium elaichi"
    },
    blackPepper: {
      title: "Organic Black Pepper | Premium Coorg Black Pepper Exporter",
      description: "Authentic organic black pepper from Coorg plantations. Bold flavor, high piperine content. Export quality for Germany, Europe, USA, Dubai markets.",
      keywords: "organic black pepper, Coorg pepper, Indian black pepper, export quality pepper, premium kali mirch"
    },
    turmeric: {
      title: "Organic Turmeric Powder | Premium Indian Haldi for Export",
      description: "Pure organic turmeric powder from India. High curcumin content, vibrant color, authentic quality. Export to Germany, USA, Dubai, Europe.",
      keywords: "organic turmeric, turmeric powder, Indian haldi, export turmeric, premium curcumin"
    },
    cinnamon: {
      title: "Organic Cinnamon | Premium Ceylon Cinnamon from India",
      description: "Premium organic cinnamon sticks and powder. Authentic flavor, export quality. International shipping to Germany, Europe, USA, Dubai.",
      keywords: "organic cinnamon, Ceylon cinnamon, Indian dalchini, export cinnamon, premium cinnamon sticks"
    },
    coffee: {
      title: "Premium Coorg Coffee Beans | Organic Indian Coffee Exporter",
      description: "Authentic Coorg coffee beans - arabica and robusta. Organic, shade-grown, rich flavor. Export quality coffee to Germany, USA, Dubai, Europe.",
      keywords: "Coorg coffee, organic coffee beans, Indian coffee, arabica coffee India, export coffee, premium coffee beans"
    },
    ginger: {
      title: "Organic Ginger | Fresh Indian Ginger for Export",
      description: "Premium organic ginger from India. Fresh, aromatic, export quality. International shipping to Germany, Europe, USA, Dubai.",
      keywords: "organic ginger, Indian ginger, export ginger, premium adrak, fresh ginger"
    }
  },

  // Social Media
  social: {
    ogType: "website",
    twitterCard: "summary_large_image",
    ogImage: "/images/coorg-spices-social.jpg",
    twitterImage: "/images/coorg-spices-social.jpg"
  },

  // Structured Data for Local Business
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Coorg Masala & Coffee",
    "image": "https://coorgmasala.com/logo.png",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "Karnataka",
      "addressLocality": "Coorg"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "12.4244",
      "longitude": "75.7382"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  }
};

// Helper function to generate meta tags
export const generateMetaTags = (page) => {
  const pageConfig = seoConfig.pages[page] || seoConfig.pages.home;
  
  return {
    title: pageConfig.title,
    meta: [
      { name: 'description', content: pageConfig.description },
      { name: 'keywords', content: pageConfig.keywords },
      { property: 'og:title', content: pageConfig.title },
      { property: 'og:description', content: pageConfig.description },
      { property: 'og:type', content: seoConfig.social.ogType },
      { property: 'og:image', content: seoConfig.social.ogImage },
      { property: 'og:url', content: `${seoConfig.siteUrl}/${page}` },
      { name: 'twitter:card', content: seoConfig.social.twitterCard },
      { name: 'twitter:title', content: pageConfig.title },
      { name: 'twitter:description', content: pageConfig.description },
      { name: 'twitter:image', content: seoConfig.social.twitterImage },
      { name: 'robots', content: 'index, follow' },
      { name: 'language', content: 'English' },
      { name: 'geo.region', content: 'IN-KA' },
      { name: 'geo.placename', content: 'Coorg' },
      { name: 'geo.position', content: '12.4244;75.7382' }
    ],
    schema: pageConfig.schema
  };
};

// Helper function to generate product meta tags
export const generateProductMetaTags = (productType) => {
  const productConfig = seoConfig.products[productType];
  
  if (!productConfig) return generateMetaTags('products');
  
  return {
    title: productConfig.title,
    meta: [
      { name: 'description', content: productConfig.description },
      { name: 'keywords', content: productConfig.keywords },
      { property: 'og:title', content: productConfig.title },
      { property: 'og:description', content: productConfig.description },
      { property: 'og:type', content: 'product' },
      { name: 'robots', content: 'index, follow' }
    ]
  };
};

export default seoConfig;
