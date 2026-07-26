// lib/search/providers/firestore-search.provider.ts
import { ISearchProvider, SearchDocument, SearchQuery, SearchResult } from "../search";
import { adminDb } from "@/lib/firebase-admin";

export class FirestoreSearchProvider implements ISearchProvider {
  private collection = "search_index";

  async index(document: SearchDocument): Promise<void> {
    await adminDb.collection(this.collection).doc(document.id).set({
      ...document,
      updatedAt: new Date(),
    });
  }

  async bulkIndex(documents: SearchDocument[]): Promise<void> {
    const batch = adminDb.batch();
    for (const doc of documents) {
      const ref = adminDb.collection(this.collection).doc(doc.id);
      batch.set(ref, { ...doc, updatedAt: new Date() });
    }
    await batch.commit();
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    let dbQuery = adminDb
      .collection(this.collection)
      .where("tenantId", "==", query.tenantId);

    if (query.types && query.types.length > 0) {
      dbQuery = dbQuery.where("type", "in", query.types);
    }

    const snapshot = await dbQuery.limit(query.limit || 20).get();
    
    const results: SearchResult[] = [];
    const queryLower = query.query.toLowerCase();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const title = (data.title || "").toLowerCase();
      const content = (data.content || "").toLowerCase();
      
      if (title.includes(queryLower) || content.includes(queryLower)) {
        results.push({
          id: doc.id,
          score: title.includes(queryLower) ? 2 : 1,
          highlights: {
            title: title.includes(queryLower) ? [data.title] : [],
            content: content.includes(queryLower) ? [data.content.substring(0, 200)] : [],
          },
          document: data as SearchDocument,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await adminDb.collection(this.collection).doc(id).delete();
  }

  async deleteByTenant(tenantId: string): Promise<void> {
    const snapshot = await adminDb.collection(this.collection).where("tenantId", "==", tenantId).get();
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  async clear(): Promise<void> {
    const snapshot = await adminDb.collection(this.collection).get();
    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}
