import { useState } from "react";

export function useShare() {
  const [shareOpen, setShareOpen] = useState(false);

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    setShareOpen(true);
  }

  return { handleShare, shareOpen, setShareOpen };
}
