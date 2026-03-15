import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useFetch } from '../src/hooks/useFetch';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, isCancel: vi.fn() } };
});

const mockIsCancel = vi.mocked(axios.isCancel);

beforeEach(() => {
  vi.clearAllMocks();
  mockIsCancel.mockReturnValue(false);
});

describe('useFetch', () => {
  it('starts in loading state with null data', () => {
    const fetchFn = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useFetch(fetchFn, 'Error'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('populates data and clears loading on successful fetch', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 42 });
    const { result } = renderHook(() => useFetch(fetchFn, 'Error'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ value: 42 });
    expect(result.current.error).toBeNull();
  });

  it('sets error message and clears loading on fetch rejection', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network fail'));
    const { result } = renderHook(() => useFetch(fetchFn, 'Custom error message'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Custom error message');
    expect(result.current.data).toBeNull();
  });

  it('does not set error when fetch is cancelled (axios.isCancel returns true)', async () => {
    mockIsCancel.mockReturnValue(true);
    const fetchFn = vi.fn().mockRejectedValue(new Error('cancelled'));
    const { result } = renderHook(() => useFetch(fetchFn, 'Should not appear'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('calls fetchFn again when retry() is called', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useFetch(fetchFn, 'Error'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchFn).toHaveBeenCalledTimes(1);

    act(() => result.current.retry());
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
  });

  it('clears error and sets loading on retry, then resolves correctly', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useFetch(fetchFn, 'Error msg'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Error msg');

    fetchFn.mockResolvedValueOnce({ value: 1 });
    act(() => result.current.retry());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ value: 1 });
    expect(result.current.error).toBeNull();
  });

  it('aborts the request on unmount', async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetchFn = vi.fn((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });
    const { unmount } = renderHook(() => useFetch(fetchFn, 'Error'));
    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('passes an AbortSignal to fetchFn', async () => {
    const fetchFn = vi.fn().mockResolvedValue(null);
    renderHook(() => useFetch(fetchFn, 'Error'));
    await waitFor(() => expect(fetchFn).toHaveBeenCalled());
    expect(fetchFn.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
  });
});
