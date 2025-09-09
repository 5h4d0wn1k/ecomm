import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noindex?: boolean
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  noindex = false
}: SEOHeadProps) {
  const siteTitle = 'DAV Creations - Premium Multi-Vendor E-Commerce Platform'
  const siteDescription = 'Shop from thousands of verified vendors across India. Find amazing products at great prices.'
  const siteImage = '/og-image.jpg'
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://davcreations.com'

  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const pageDescription = description || siteDescription
  const pageImage = image || siteImage
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl)
  const pageKeywords = keywords?.join(', ') || 'ecommerce, multi-vendor, online shopping, India, verified vendors'

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={author || 'DAV Creations Team'} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Article Specific Meta Tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Product Specific Meta Tags */}
      {type === 'product' && (
        <>
          <meta property="product:price:amount" content="0" />
          <meta property="product:price:currency" content="INR" />
        </>
      )}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#ec4899" />
      <meta name="msapplication-TileColor" content="#ec4899" />
      <link rel="canonical" href={pageUrl} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': type === 'product' ? 'Product' : 'WebSite',
            name: pageTitle,
            description: pageDescription,
            url: pageUrl,
            image: pageImage,
            ...(type === 'product' && {
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock'
              }
            }),
            publisher: {
              '@type': 'Organization',
              name: siteTitle,
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/assets/logos/favicon.jpg`
              }
            }
          })
        }}
      />
    </Head>
  )
}

// Hook for dynamic SEO updates
export function useSEO(props: SEOHeadProps) {
  // This would typically update the document head dynamically
  // For now, we'll rely on Next.js Head component
  return props
}