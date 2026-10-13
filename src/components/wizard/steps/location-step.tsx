"use client";

import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError, FieldHint, Input, Label, Select } from "@/components/ui/field";
import { COUNTRIES, getCountry, getLocationGuidance, getRegions } from "@/lib/data/locations";
import type { CountryCode } from "@/lib/schema";
import type { StepProps } from "../setup-wizard";

export function LocationStep({ profile, setProfile, errors }: StepProps) {
  const { country, region, locality } = profile.location;
  const regions = getRegions(country);
  const countryInfo = getCountry(country);
  const guidance = getLocationGuidance(country, region);
  const showLocality = country !== "UNSPECIFIED";

  const update = (patch: Partial<typeof profile.location>) =>
    setProfile((p) => ({ ...p, location: { ...p.location, ...patch } }));

  return (
    <div className="space-y-5">
      <p className="max-w-xl leading-relaxed text-navy-600">
        Your location is only used to show relevant official resources. Precise details are optional — FORTIS never
        uses geolocation and doesn&apos;t predict hazards.
      </p>
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              value={country}
              onChange={(e) => update({ country: e.target.value as CountryCode, region: "" })}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>

          {regions.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="region">
                {countryInfo.regionLabel} <span className="ml-1 text-xs font-medium text-muted">Optional</span>
              </Label>
              <Select id="region" value={region} onChange={(e) => update({ region: e.target.value })}>
                <option value="">Skip — don&apos;t specify</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {showLocality ? (
            <div className="space-y-2">
              <Label htmlFor="locality">
                City or postal code <span className="ml-1 text-xs font-medium text-muted">Optional</span>
              </Label>
              <Input
                id="locality"
                value={locality}
                maxLength={80}
                autoComplete="off"
                placeholder="e.g., Springfield"
                aria-invalid={errors["location.locality"] ? true : undefined}
                aria-describedby="locality-hint"
                onChange={(e) => update({ locality: e.target.value })}
              />
              <FieldHint id="locality-hint">Shown on your printed plan only. It isn&apos;t used for any lookups.</FieldHint>
              <FieldError message={errors["location.locality"]} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-xl border border-line bg-white/60 p-4 text-[13px] leading-relaxed text-navy-600">
        <Info className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden />
        <p>
          {guidance.note}
          {guidance.isJurisdictionSpecific ? " We'll include a verified official link for your area in your plan." : null}
        </p>
      </div>
    </div>
  );
}
