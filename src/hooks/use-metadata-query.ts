import { useMutation } from '@tanstack/react-query';

import { fetchMetadata } from '@/api/media-api';
import { useDownloadStore } from '@/store/download-store';
import { mediumImpact } from '@/utils/haptics';

export function useMetadataMutation() {
  const setCurrentMetadata = useDownloadStore((s) => s.setCurrentMetadata);

  return useMutation({
    mutationFn: async (url: string) => {
      await mediumImpact();
      return fetchMetadata(url);
    },
    onSuccess: (data) => {
      setCurrentMetadata(data);
    },
  });
}
