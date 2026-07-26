// lib/search/search.ts
export interface SearchDocument {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  tenantId: string;
  types?: string[];
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchResult {
  id: string;
  score: number;
  highlights: Record<string, string[]>;
  document: SearchDocument;
}

export interface ISearchProvider {
  index(document: SearchDocument): Promise<void>;
  bulkIndex(documents: SearchDocument[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  delete(id: string, tenantId: string): Promise<void>;
  deleteByTenant(tenantId: string): Promise<void>;
  clear(): Promise<void>;
}

export class SearchService {
  private provider: ISearchProvider;
  private static instance: SearchService;

  private constructor(provider: ISearchProvider) {
    this.provider = provider;
  }

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService({
        index: async () => {},
        bulkIndex: async () => {},
        search: async () => [],
        delete: async () => {},
        deleteByTenant: async () => {},
        clear: async () => {},
      } as ISearchProvider);
    }
    return SearchService.instance;
  }

  async index(document: SearchDocument): Promise<void> {
    return this.provider.index(document);
  }

  async bulkIndex(documents: SearchDocument[]): Promise<void> {
    return this.provider.bulkIndex(documents);
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    return this.provider.search(query);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    return this.provider.delete(id, tenantId);
  }

  async deleteByTenant(tenantId: string): Promise<void> {
    return this.provider.deleteByTenant(tenantId);
  }

  async clear(): Promise<void> {
    return this.provider.clear();
  }
}

export const searchService = SearchService.getInstance();
