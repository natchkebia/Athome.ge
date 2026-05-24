import SearchResultsPage from "@/components/search/SearchResultsPage";

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    categorySlug?: string;
    brandSlug?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <SearchResultsPage
      initialQuery={params.query ?? ""}
      initialCategorySlug={params.categorySlug}
      initialBrandSlug={params.brandSlug}
    />
  );
}
