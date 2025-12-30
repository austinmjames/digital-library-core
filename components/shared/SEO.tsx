import { DrashRef } from "@/lib/utils/drash-ref";
import Head from "next/head";
import React from "react";

/**
 * SEO Component
 * Role: Phase 6 - Discovery & Performance.
 * Purpose: Generates dynamic OpenGraph and Meta tags for canonical references.
 * Usage: Inserted into the Reader Page to make every verse searchable.
 */

interface SEOProps {
  refStr: string;
  excerpt?: string;
  bookTitle: string;
}

export const SEO: React.FC<SEOProps> = ({ refStr, excerpt, bookTitle }) => {
  const displayRef = DrashRef.toDisplay(refStr);
  const title = `${displayRef} | DrashX Digital Beit Midrash`;
  const description = excerpt
    ? `Study ${displayRef}: ${excerpt.substring(0, 150)}...`
    : `Explore the canonical text of ${bookTitle} at ${displayRef} with community insights and AI scholarship.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drashx.com";
  const canonicalUrl = `${siteUrl}/read/${refStr.replace(/\s+/g, "_")}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}/og-image.png`} />

      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
};
