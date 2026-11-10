"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

const MIN_FONT_SIZE_PX = 11;
const MAX_FONT_SIZE_PX = 24;
const SEARCH_STEPS = 12;

function fitsInsidePage(page: HTMLElement) {
  return page.scrollHeight <= page.clientHeight;
}

function applyFontSize(page: HTMLElement, fontSize: number) {
  page.style.setProperty("--print-font-size", `${fontSize}px`);
}

function findLargestFittingFontSize(page: HTMLElement) {
  let smallest = MIN_FONT_SIZE_PX;
  let largest = MAX_FONT_SIZE_PX;

  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const candidate = (smallest + largest) / 2;

    applyFontSize(page, candidate);

    if (fitsInsidePage(page)) {
      smallest = candidate;
    } else {
      largest = candidate;
    }
  }

  return Math.floor(smallest * 10) / 10;
}

/**
 * Ajusta o tamanho da fonte da ata para o maior valor que ainda cabe
 * em uma única folha A4. A folha tem altura fixa, então o texto nunca
 * transborda para uma segunda página.
 */
export function usePrintFit(
  pageRef: RefObject<HTMLElement | null>,
  contentKey: string,
) {
  const fit = useCallback(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    applyFontSize(page, findLargestFittingFontSize(page));
  }, [pageRef]);

  useLayoutEffect(() => {
    fit();
  }, [fit, contentKey]);

  useLayoutEffect(() => {
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) {
        fit();
      }
    });

    window.addEventListener("beforeprint", fit);

    return () => {
      cancelled = true;
      window.removeEventListener("beforeprint", fit);
    };
  }, [fit]);
}

/**
 * Reduz visualmente a folha A4 em telas estreitas, sem alterar o layout
 * interno usado para calcular o tamanho da fonte e para imprimir.
 */
export function usePreviewScale<TPage extends HTMLElement>() {
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<TPage>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const page = pageRef.current;

    if (!stage || !page) {
      return;
    }

    function updateScale() {
      if (!stage || !page) {
        return;
      }

      const scale = Math.min(1, stage.clientWidth / page.offsetWidth);

      stage.style.setProperty("--preview-scale", String(scale));
      stage.style.setProperty(
        "--preview-height",
        `${page.offsetHeight * scale}px`,
      );
    }

    const observer = new ResizeObserver(updateScale);

    observer.observe(stage);
    updateScale();

    return () => observer.disconnect();
  }, []);

  return { stageRef, pageRef };
}
