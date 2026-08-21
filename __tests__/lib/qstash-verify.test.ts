const verify = jest.fn();

jest.mock('@upstash/qstash', () => ({
  Receiver: jest.fn().mockImplementation(() => ({ verify })),
}));

describe('verifyQStashSignature', () => {
  beforeEach(() => {
    jest.resetModules();
    verify.mockReset();
  });

  test('returns the authenticated request body so webhook handlers do not consume it twice', async () => {
    verify.mockResolvedValue(true);
    const { verifyQStashSignature } = await import('@/lib/qstash-verify');
    const request = new Request('https://example.test/webhook', {
      method: 'POST',
      headers: { 'Upstash-Signature': 'signature' },
      body: JSON.stringify({ type: 'EVENT_OUTBOX', data: { limit: 2 } }),
    });

    await expect(verifyQStashSignature(request)).resolves.toBe('{"type":"EVENT_OUTBOX","data":{"limit":2}}');
    expect(verify).toHaveBeenCalledWith({
      signature: 'signature',
      body: '{"type":"EVENT_OUTBOX","data":{"limit":2}}',
    });
  });
});
