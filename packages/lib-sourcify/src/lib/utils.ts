import { logWarn } from './logger';

require('isomorphic-fetch');

interface RequestInitTimeout extends RequestInit {
  timeout?: number;
}

export async function fetchWithTimeout(
  resource: string,
  options: RequestInitTimeout = {}
) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    logWarn(`Aborting request ${resource} because of timeout ${timeout}`);
    controller.abort();
  }, timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}
