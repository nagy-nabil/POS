export type TypedQueryParams = {
  /**
   * should be filter based on the product name or id
   *
   * empty string "" means no filter
   */
  productFilter: string | undefined;
  categoryFilter: string | undefined;

  /**
   * pagnation number of current active page
   */
  pageNumber: string | undefined
}
