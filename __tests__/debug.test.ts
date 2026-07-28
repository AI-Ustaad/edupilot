const mockDoc = { get: jest.fn() };

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn().mockImplementation((name: string) => {
      return {
        doc: () => mockDoc,
      };
    }),
  },
}));

describe("debug", () => {
  it("test mock access", () => {
    const adminDb = require("@/lib/firebase-admin").adminDb;
    const doc = adminDb.collection("tenants").doc("tenant_1");
    console.log("doc:", doc);
    console.log("same mockDoc?", doc === mockDoc);
  });
});
