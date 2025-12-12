"use client";

import { useEffect } from "react";

export default function AtomSearchCleanup() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlClass: html.className,
      htmlStyle: html.getAttribute("style"),
      htmlDataset: { ...html.dataset },
      bodyClass: body.className,
      bodyStyle: body.getAttribute("style"),
      bodyDataset: { ...body.dataset },
    };

    return () => {
      html.className = prev.htmlClass;
      body.className = prev.bodyClass;

      if (prev.htmlStyle == null) html.removeAttribute("style");
      else html.setAttribute("style", prev.htmlStyle);

      if (prev.bodyStyle == null) body.removeAttribute("style");
      else body.setAttribute("style", prev.bodyStyle);

      for (const k of Object.keys(html.dataset)) {
        if (!(k in prev.htmlDataset)) delete (html.dataset as any)[k];
      }
      for (const [k, v] of Object.entries(prev.htmlDataset)) {
        (html.dataset as any)[k] = v as string;
      }

      for (const k of Object.keys(body.dataset)) {
        if (!(k in prev.bodyDataset)) delete (body.dataset as any)[k];
      }
      for (const [k, v] of Object.entries(prev.bodyDataset)) {
        (body.dataset as any)[k] = v as string;
      }
    };
  }, []);

  return null;
}
