import { describe, expect, it } from 'vitest';

import { apiClient } from '../api-client';

describe('apiClient', () => {
  it('sends browser credentials for HttpOnly cookie authentication', () => {
    expect(apiClient.defaults.withCredentials).toBe(true);
  });
});
