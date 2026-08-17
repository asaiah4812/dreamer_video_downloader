import { apiClient } from '@/api/client';
import { getApiBaseUrl } from '@/constants/config';
import type { MediaMetadata, MediaQuality } from '@/types/media';
import { pickBestQuality } from '@/utils/media';
import { useSettingsStore } from '@/store/settings-store';


export type DownloadRequest = {
  url: string;
  qualityId: string;
  format: string;
  type: 'video' | 'audio' | 'image';
};

export type DownloadJobResponse = {
  jobId: string;
  /** Always use this — file is prepared on your PC then sent to the phone */
  streamUrl: string;
  serverPrepared?: boolean;
  proxied?: boolean;
};

export async function fetchMetadata(url: string): Promise<MediaMetadata> {
  const { data } = await apiClient.post<{ data: MediaMetadata }>('/metadata', { url });
  return data.data;
}

export async function startServerDownload(
  payload: DownloadRequest,
): Promise<DownloadJobResponse> {
  const userEmail = useSettingsStore.getState().userEmail;

  try {
    const { data } = await apiClient.post<{ data: DownloadJobResponse; trialsLeft?: number; subscribed?: boolean }>('/download', {
      ...payload,
      email: userEmail || undefined,
      clientType: 'mobile',
    });

    if (data?.trialsLeft !== undefined) {
      useSettingsStore.getState().setTrialsLeft(data.trialsLeft);
    }
    if (data?.subscribed !== undefined) {
      useSettingsStore.getState().setIsSubscribed(data.subscribed);
    }

    return data.data;
  } catch (error: any) {
    if (error?.response?.status === 402 || error?.response?.data?.error === 'Trial limit reached') {
      useSettingsStore.getState().setTrialsLeft(0);
      throw new Error('Trial limit reached. Free trial limit (3 downloads) reached. Subscribe for ₦600/mo via Paystack to continue!');
    }
    throw error;
  }
}


export type HealthCheckResult = {
  ok: boolean;
  url: string;
  message?: string;
};

export async function checkHealth(): Promise<HealthCheckResult> {
  const url = getApiBaseUrl();
  try {
    const { data } = await apiClient.get<{ status: string; ytdlp?: boolean }>('/health');
    if (data?.status === 'ok') {
      return { ok: true, url };
    }
    return { ok: false, url, message: 'Server responded but status is not ok' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return { ok: false, url, message };
  }
}

/** Fetch metadata from Flask + pick best video (or audio) format. */
export async function resolveMediaForDownload(url: string): Promise<{
  metadata: MediaMetadata;
  quality: MediaQuality;
}> {
  const metadata = await fetchMetadata(url);
  const quality = pickBestQuality(metadata);
  if (!quality) {
    throw new Error('No downloadable formats found for this link');
  }
  return { metadata, quality };
}

export async function checkSubscriptionStatus(email: string): Promise<{ subscribed: boolean }> {
  try {
    const { data } = await apiClient.get<{ subscribed: boolean }>(`/subscription/check?email=${encodeURIComponent(email)}`);
    return { subscribed: Boolean(data?.subscribed) };
  } catch {
    return { subscribed: false };
  }
}

export async function fetchTrialStatus(): Promise<{ trialsLeft: number }> {
  try {
    const { data } = await apiClient.post<{ trialsLeft: number }>('/trial/status');
    return { trialsLeft: data?.trialsLeft ?? 3 };
  } catch {
    return { trialsLeft: 3 };
  }
}

