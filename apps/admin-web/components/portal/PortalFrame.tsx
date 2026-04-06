"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PortalLanguage = "en" | "my" | "both";

function bi(lang: PortalLanguage, en: string, my: string) {
  if (lang === "en") return en;
  if (lang === "my") return my;
  return `${en} / ${my}`;
}

type ActionButton = {
  key: string;
  labelEn: string;
  labelMy: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  tone?: "primary" | "secondary" | "accent" | "ghost" | "danger";
  disabled?: boolean;
};

type PortalFrameProps = {
  kickerEn?: string;
  kickerMy?: string;
  titleEn: string;
  titleMy: string;
  subtitleEn?: string;
  subtitleMy?: string;
  lang: PortalLanguage;
  actions?: ActionButton[];
  prevHref?: string;
  nextHref?: string;
  prevLabelEn?: string;
  prevLabelMy?: string;
  nextLabelEn?: string;
  nextLabelMy?: string;
  children: React.ReactNode;
};

function buttonToneClass(tone: ActionButton["tone"]) {
  switch (tone) {
    case "accent":
      return "btn btn-accent";
    case "secondary":
      return "btn btn-secondary";
    case "ghost":
      return "btn btn-ghost";
    case "danger":
      return "btn btn-danger";
    case "primary":
    default:
      return "btn btn-primary";
  }
}

function ActionRenderer({
  action,
  lang,
}: {
  action: ActionButton;
  lang: PortalLanguage;
}) {
  const label = bi(lang, action.labelEn, action.labelMy);
  const cls = buttonToneClass(action.tone);

  if (action.href) {
    return (
      <Link href={action.href} className={cls} aria-disabled={action.disabled}>
        {action.icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={cls}
    >
      {action.icon}
      <span>{label}</span>
    </button>
  );
}

export default function PortalFrame({
  kickerEn = "Administration",
  kickerMy = "စီမံခန့်ခွဲမှု",
  titleEn,
  titleMy,
  subtitleEn,
  subtitleMy,
  lang,
  actions = [],
  prevHref,
  nextHref,
  prevLabelEn = "Previous",
  prevLabelMy = "ယခင်",
  nextLabelEn = "Next",
  nextLabelMy = "နောက်တစ်ခု",
  children,
}: PortalFrameProps) {
  return (
    <div className="page-shell fade-in-up">
      <section className="page-hero">
        <div className="section-head">
          <div>
            <div className="page-kicker">{bi(lang, kickerEn, kickerMy)}</div>
            <h1 className="page-title">{bi(lang, titleEn, titleMy)}</h1>
            {(subtitleEn || subtitleMy) && (
              <p className="page-subtitle">
                {bi(lang, subtitleEn ?? "", subtitleMy ?? "")}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="page-actions">
              {actions.map((action) => (
                <ActionRenderer key={action.key} action={action} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mt-5 space-y-5">{children}</div>

      {(prevHref || nextHref) && (
        <div className="sticky-footer-nav scale-in">
          <div>
            {prevHref ? (
              <Link href={prevHref} className="btn btn-secondary">
                <ChevronLeft size={16} />
                <span>{bi(lang, prevLabelEn, prevLabelMy)}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {nextHref ? (
              <Link href={nextHref} className="btn btn-primary">
                <span>{bi(lang, nextLabelEn, nextLabelMy)}</span>
                <ChevronRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}