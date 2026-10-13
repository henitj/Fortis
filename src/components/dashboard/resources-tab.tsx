"use client";

import * as React from "react";
import { ExternalLink, Info, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HAZARD_ICONS } from "@/components/plan/icons";
import { getHazard } from "@/lib/data/hazards";
import { describeLocation } from "@/lib/data/locations";
import { getResource, type Resource, type ResourceId } from "@/lib/data/resources";
import type { Profile } from "@/lib/schema";
import { Notice, SectionHeader } from "./shared";
import type { PlanView } from "./use-plan-view";

export function householdResourceIds(profile: Profile): ResourceId[] {
  const h = profile.household;
  const ids: ResourceId[] = [];
  if (h.children > 0) ids.push("ready-kids");
  if (h.olderAdults > 0) ids.push("ready-older-adults");
  if (h.mobilityNeeds === "yes" || h.poweredMedical === "yes" || h.communicationNeeds === "yes") ids.push("ready-disability");
  if (h.pets > 0) ids.push("ready-pets");
  return ids;
}

export const GENERAL_RESOURCE_IDS: ResourceId[] = [
  "ready-plan",
  "ready-kit",
  "ready-evacuation",
  "ready-alerts",
  "ready-financial",
  "ready-be-informed",
  "fema-home",
];

export function ResourcesTab({ view }: { view: PlanView }) {
  const { plan, guidance } = view;
  const loc = plan.profile.location;
  const isUS = loc.country === "US";
  const household = householdResourceIds(plan.profile);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Official resources"
        description="Every link goes to a government or official public-safety source. FORTIS does not provide live alerts — always follow instructions from local officials."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-[18px] text-navy-600" aria-hidden /> {describeLocation(loc.country, loc.region, loc.locality)}
          </CardTitle>
          <CardDescription>{guidance.note}</CardDescription>
        </CardHeader>
        {guidance.resources.length > 0 ? (
          <CardContent>
            <ResourceGrid resources={guidance.resources} />
          </CardContent>
        ) : null}
      </Card>

      {!isUS ? (
        <Notice icon={Info} title="About the hazard links below">
          Hazard guidance below comes from U.S. agencies and covers general safety principles. Your national and local
          authorities&apos; instructions take priority.
        </Notice>
      ) : null}

      <section aria-labelledby="hazard-res">
        <h3 id="hazard-res" className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          For your selected hazards
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {plan.profile.hazards.map((id) => {
            const hazard = getHazard(id);
            const Icon = HAZARD_ICONS[id];
            return (
              <Card key={id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2.5 text-[15px]">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-paper">
                      <Icon className="size-4 text-navy-600" aria-hidden />
                    </span>
                    {hazard.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {hazard.resources.map((rid) => (
                      <LinkRow key={rid} resource={getResource(rid)} />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {household.length > 0 ? (
        <section aria-labelledby="household-res">
          <h3 id="household-res" className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            For your household
          </h3>
          <ResourceGrid resources={household.map(getResource)} />
        </section>
      ) : null}

      <section aria-labelledby="general-res">
        <h3 id="general-res" className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          General preparedness
        </h3>
        <ResourceGrid resources={GENERAL_RESOURCE_IDS.map(getResource)} />
      </section>
    </div>
  );
}

function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <li key={r.id}>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded-xl border border-line bg-white p-4 shadow-card transition-colors hover:border-navy-600/30"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{r.publisher}</span>
            <span className="mt-1 flex items-center gap-1.5 font-semibold text-navy group-hover:underline group-hover:underline-offset-2">
              {r.title}
              <ExternalLink className="size-3.5 text-muted" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </span>
            {r.description ? <span className="mt-1 text-[13px] leading-relaxed text-muted">{r.description}</span> : null}
            <span className="mt-auto pt-2 font-mono text-[11px] text-muted/80">{new URL(r.url).hostname.replace(/^www\./, "")}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function LinkRow({ resource: r }: { resource: Resource }) {
  return (
    <li>
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-paper"
      >
        <span>
          <span className="font-semibold text-navy">{r.title}</span>
          <span className="text-muted"> · {r.publisher}</span>
        </span>
        <ExternalLink className="size-3.5 shrink-0 text-muted" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </li>
  );
}
