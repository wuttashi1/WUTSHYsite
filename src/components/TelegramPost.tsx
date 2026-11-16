"use client";

import { useEffect, useRef } from "react";

export function TelegramPost({ id }: { id: number }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const widget = document.createElement("script");
    widget.async = true;
    widget.src = "https://telegram.org/js/telegram-widget.js?22";
    widget.dataset.telegramPost = `wutshy/${id}`;
    widget.dataset.width = "100%";
    host.appendChild(widget);
    return () => host.replaceChildren();
  }, [id]);
  return <div ref={container} />;
}
