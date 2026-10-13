"use client";

import * as React from "react";
import { AlertTriangle, MapPin, Phone, Plus, Printer, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldHint } from "@/components/ui/field";
import { updateCommunication } from "@/lib/client/plan-store";
import { printPlan } from "@/lib/client/print";
import type { Communication, Contact } from "@/lib/schema";
import { createId } from "@/lib/utils";
import { Notice, SectionHeader } from "./shared";
import type { PlanView } from "./use-plan-view";

const MAX_CONTACTS = 12;
const PHONE_PATTERN = /^[0-9+()\-.\s#*xX]*$/;

function phoneWarning(phone: string): string | undefined {
  if (!phone.trim()) return undefined;
  if (!PHONE_PATTERN.test(phone)) return "Phone numbers usually contain only digits, spaces and + ( ) - characters.";
  if (phone.replace(/\D/g, "").length < 3) return "This looks too short to be a phone number.";
  return undefined;
}

export function ContactsTab({ view }: { view: PlanView }) {
  const c = view.plan.communication;
  const set = (patch: Partial<Communication>) => updateCommunication((prev) => ({ ...prev, ...patch }));
  const setContact = (id: string, patch: Partial<Contact>) =>
    updateCommunication((prev) => ({ ...prev, contacts: prev.contacts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const lastAdded = React.useRef<string | null>(null);

  const addContact = () => {
    const id = createId("contact");
    lastAdded.current = id;
    updateCommunication((prev) => ({ ...prev, contacts: [...prev.contacts, { id, label: "", phone: "", note: "" }] }));
  };
  const removeContact = (id: string) =>
    updateCommunication((prev) => ({ ...prev, contacts: prev.contacts.filter((x) => x.id !== id) }));

  React.useEffect(() => {
    if (!lastAdded.current) return;
    document.getElementById(`${lastAdded.current}-label`)?.focus();
    lastAdded.current = null;
  }, [c.contacts.length]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Communication plan"
        description="Decide how your household will reach each other and where you'll meet if you're separated. Phone networks may be congested in an emergency — text messages often get through when calls don't."
        action={
          <Button variant="secondary" onClick={() => printPlan("card")}>
            <Printer aria-hidden /> Print contact card
          </Button>
        }
      />

      <Notice icon={AlertTriangle} tone="warn" title="Saved only in this browser">
        Contact details never leave your device. They will be lost if you clear browser data or switch devices, so print a
        contact card or export your plan as a backup.
      </Notice>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-[18px] text-navy-600" aria-hidden /> Household & emergency contacts
            </CardTitle>
            <CardDescription>Family members, caregivers, neighbors, doctors, schools or workplaces.</CardDescription>
          </CardHeader>
          <CardContent>
            {c.contacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong px-5 py-8 text-center">
                <Phone className="mx-auto size-6 text-muted" aria-hidden />
                <p className="mt-2 text-sm font-medium text-navy">No contacts yet</p>
                <p className="mt-0.5 text-[13px] text-muted">Add the people your household would need to reach.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {c.contacts.map((contact, i) => {
                  const warning = phoneWarning(contact.phone);
                  return (
                    <li key={contact.id} className="rounded-xl border border-line bg-paper/40 p-4">
                      <fieldset>
                        <legend className="sr-only">Contact {i + 1}</legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label className="mb-1.5 block" htmlFor={`${contact.id}-label`}>Name or role</Label>
                            <Input
                              id={`${contact.id}-label`}
                              value={contact.label}
                              maxLength={80}
                              placeholder="e.g. Maria (sister)"
                              autoComplete="off"
                              onChange={(e) => setContact(contact.id, { label: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="mb-1.5 block" htmlFor={`${contact.id}-phone`}>Phone</Label>
                            <Input
                              id={`${contact.id}-phone`}
                              type="tel"
                              inputMode="tel"
                              value={contact.phone}
                              maxLength={40}
                              autoComplete="off"
                              aria-describedby={warning ? `${contact.id}-phone-warn` : undefined}
                              onChange={(e) => setContact(contact.id, { phone: e.target.value })}
                            />
                          </div>
                        </div>
                        {warning ? (
                          <p id={`${contact.id}-phone-warn`} className="mt-1.5 text-xs font-medium text-warn">
                            {warning}
                          </p>
                        ) : null}
                        <div className="mt-3 flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="mb-1.5 block" htmlFor={`${contact.id}-note`}>Note (optional)</Label>
                            <Input
                              id={`${contact.id}-note`}
                              value={contact.note}
                              maxLength={160}
                              placeholder="e.g. Works nights; text first"
                              onChange={(e) => setContact(contact.id, { note: e.target.value })}
                            />
                          </div>
                          <Button
                            variant="danger-ghost"
                            size="icon"
                            onClick={() => removeContact(contact.id)}
                            aria-label={`Remove ${contact.label || `contact ${i + 1}`}`}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </fieldset>
                    </li>
                  );
                })}
              </ul>
            )}
            <Button variant="secondary" className="mt-4 w-full" onClick={addContact} disabled={c.contacts.length >= MAX_CONTACTS}>
              <Plus aria-hidden /> {c.contacts.length >= MAX_CONTACTS ? `Maximum of ${MAX_CONTACTS} contacts` : "Add contact"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="size-[18px] text-navy-600" aria-hidden /> Out-of-area contact
              </CardTitle>
              <CardDescription>
                Someone outside your region everyone can check in with. Long-distance contact can be easier when local lines
                are busy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="ooa-name">Name</Label>
                  <Input id="ooa-name" value={c.outOfArea.name} maxLength={80} autoComplete="off"
                    onChange={(e) => set({ outOfArea: { ...c.outOfArea, name: e.target.value } })} />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="ooa-phone">Phone</Label>
                  <Input id="ooa-phone" type="tel" inputMode="tel" value={c.outOfArea.phone} maxLength={40} autoComplete="off"
                    aria-describedby={phoneWarning(c.outOfArea.phone) ? "ooa-phone-warn" : undefined}
                    onChange={(e) => set({ outOfArea: { ...c.outOfArea, phone: e.target.value } })} />
                </div>
              </div>
              {phoneWarning(c.outOfArea.phone) ? (
                <p id="ooa-phone-warn" className="mt-1.5 text-xs font-medium text-warn">{phoneWarning(c.outOfArea.phone)}</p>
              ) : null}
              <div className="mt-3">
                <Label className="mb-1.5 block" htmlFor="ooa-note">Note (optional)</Label>
                <Input id="ooa-note" value={c.outOfArea.note} maxLength={160} placeholder="e.g. Lives in another state"
                  onChange={(e) => set({ outOfArea: { ...c.outOfArea, note: e.target.value } })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-[18px] text-navy-600" aria-hidden /> Meeting places
              </CardTitle>
              <CardDescription>One spot right outside your home, and one outside your neighborhood in case you can&apos;t return.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {(["primary", "alternate"] as const).map((key) => {
                const place = c.meetingPlaces[key];
                const label = key === "primary" ? "Near home" : "Outside your neighborhood";
                return (
                  <fieldset key={key}>
                    <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      {key === "primary" ? "Primary" : "Alternate"} · {label}
                    </legend>
                    <Label className="mb-1.5 block" htmlFor={`mp-${key}-name`}>Place</Label>
                    <Input id={`mp-${key}-name`} value={place.name} maxLength={120}
                      placeholder={key === "primary" ? "e.g. The oak tree at the end of the driveway" : "e.g. Lincoln Library, Main St"}
                      onChange={(e) => set({ meetingPlaces: { ...c.meetingPlaces, [key]: { ...place, name: e.target.value } } })} />
                    <Label className="mt-3 mb-1.5 block" htmlFor={`mp-${key}-details`}>Address or directions (optional)</Label>
                    <Input id={`mp-${key}-details`} value={place.details} maxLength={300}
                      onChange={(e) => set({ meetingPlaces: { ...c.meetingPlaces, [key]: { ...place, details: e.target.value } } })} />
                  </fieldset>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Household instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="instructions" className="sr-only">Household instructions</Label>
            <Textarea id="instructions" rows={5} maxLength={1200} value={c.instructions}
              placeholder="e.g. Text the group chat first. Whoever is closest picks up the kids. Shut off gas only if you smell it."
              onChange={(e) => set({ instructions: e.target.value })} />
            <FieldHint className="mt-1.5 text-right tabular-nums">{c.instructions.length}/1200</FieldHint>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reunification arrangements</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="reunification" className="sr-only">Reunification arrangements</Label>
            <Textarea id="reunification" rows={5} maxLength={1200} value={c.reunification}
              placeholder="e.g. School releases students only to listed adults — Grandma is authorized. Check in with the out-of-area contact every 2 hours."
              onChange={(e) => set({ reunification: e.target.value })} />
            <FieldHint className="mt-1.5 text-right tabular-nums">{c.reunification.length}/1200</FieldHint>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
