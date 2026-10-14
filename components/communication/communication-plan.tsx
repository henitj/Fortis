"use client";

import { Plus, Trash2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommunicationPlan } from "@/lib/types";

interface Props {
  value: CommunicationPlan;
  onChange: (value: CommunicationPlan) => void;
}

export function CommunicationPlanEditor({ value, onChange }: Props) {
  function addContact() {
    if (value.contacts.length >= 15) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `contact-${Date.now()}-${value.contacts.length}`;
    onChange({
      ...value,
      contacts: [...value.contacts, { id, label: "", phone: "" }],
    });
  }
  function changeContact(id: string, field: "label" | "phone", text: string) {
    onChange({
      ...value,
      contacts: value.contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: text } : contact,
      ),
    });
  }

  return (
    <section
      id="communication"
      className="scroll-mt-28"
      aria-labelledby="communication-title"
    >
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-forest">
          03 / Stay connected
        </p>
        <h2
          id="communication-title"
          className="font-display mt-2 text-2xl font-extrabold tracking-[-0.045em] sm:text-[30px]"
        >
          Your communication plan.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate">
          Write down what your household needs to reconnect. Leave any field
          blank if it doesn&apos;t apply.
        </p>
      </div>
      <div className="space-y-4">
        <div className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-extrabold">
                Household contacts
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate">
                Names or labels and phone numbers, only if you choose to enter
                them.
              </p>
            </div>
            <Button
              variant="outline"
              size="small"
              onClick={addContact}
              disabled={value.contacts.length >= 15}
            >
              <Plus size={16} /> Add contact
            </Button>
          </div>
          {value.contacts.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-[#cbd2ce] bg-[#fafbf9] p-5 text-sm text-slate">
              No contacts added yet. Add someone your household may need to
              reach.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {value.contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="grid gap-3 rounded-xl border border-line bg-[#fcfcfb] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div>
                    <label
                      className="field-label"
                      htmlFor={`contact-label-${contact.id}`}
                    >
                      Contact {index + 1} name or label
                    </label>
                    <input
                      id={`contact-label-${contact.id}`}
                      className="field-input"
                      maxLength={80}
                      placeholder="e.g. Parent / neighbor"
                      value={contact.label}
                      onChange={(event) =>
                        changeContact(contact.id, "label", event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="field-label"
                      htmlFor={`contact-phone-${contact.id}`}
                    >
                      Contact {index + 1} phone number
                    </label>
                    <input
                      id={`contact-phone-${contact.id}`}
                      className="field-input"
                      type="tel"
                      maxLength={60}
                      placeholder="As you want it printed"
                      value={contact.phone}
                      onChange={(event) =>
                        changeContact(contact.id, "phone", event.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        contacts: value.contacts.filter(
                          (item) => item.id !== contact.id,
                        ),
                      })
                    }
                    className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-3 text-xs font-bold text-danger hover:bg-[#fff4f2]"
                    aria-label={`Remove contact ${index + 1}`}
                  >
                    <Trash2 size={15} />{" "}
                    <span className="sm:sr-only">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5 sm:p-7">
          <h3 className="font-display text-base font-extrabold">
            Out-of-area contact
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate">
            Someone outside your immediate area who can help relay updates if
            local communication is difficult.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              id="out-name"
              label="Name or label"
              value={value.outOfAreaName}
              maxLength={80}
              onChange={(outOfAreaName) =>
                onChange({ ...value, outOfAreaName })
              }
              placeholder="e.g. Aunt Sam"
            />
            <TextField
              id="out-phone"
              label="Phone number"
              value={value.outOfAreaPhone}
              maxLength={60}
              onChange={(outOfAreaPhone) =>
                onChange({ ...value, outOfAreaPhone })
              }
              placeholder="As you want it printed"
              type="tel"
            />
          </div>
        </div>
        <div className="card p-5 sm:p-7">
          <h3 className="font-display text-base font-extrabold">
            Meeting places
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate">
            Agree on a first choice and an alternative. Check that each place is
            suitable for everyone in your household.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              id="primary-meeting"
              label="Primary meeting place"
              value={value.primaryMeeting}
              maxLength={200}
              onChange={(primaryMeeting) =>
                onChange({ ...value, primaryMeeting })
              }
              placeholder="A nearby, agreed-on place"
            />
            <TextField
              id="alternate-meeting"
              label="Alternate meeting place"
              value={value.alternateMeeting}
              maxLength={200}
              onChange={(alternateMeeting) =>
                onChange({ ...value, alternateMeeting })
              }
              placeholder="A second option"
            />
          </div>
        </div>
        <div className="card p-5 sm:p-7">
          <h3 className="font-display text-base font-extrabold">
            The details everyone should know
          </h3>
          <div className="mt-5 space-y-5">
            <div>
              <label
                className="field-label"
                htmlFor="communication-instructions"
              >
                Household communication instructions
              </label>
              <textarea
                id="communication-instructions"
                className="field-input min-h-[100px] resize-y"
                maxLength={1000}
                placeholder="e.g. If calls are difficult, try text messages; check the agreed-on contact."
                value={value.instructions}
                onChange={(event) =>
                  onChange({ ...value, instructions: event.target.value })
                }
              />
              <p className="field-hint">
                Keep guidance practical. Do not include passwords or sensitive
                medical details.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="reunification">
                Reunification arrangements
              </label>
              <textarea
                id="reunification"
                className="field-input min-h-[100px] resize-y"
                maxLength={1000}
                placeholder="e.g. Who picks up children, where to reconnect, and a backup arrangement."
                value={value.reunification}
                onChange={(event) =>
                  onChange({ ...value, reunification: event.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex gap-3 rounded-xl border border-[#d4e0d7] bg-[#f1f6f1] p-4 text-xs leading-6 text-forest">
        <LockKeyhole size={18} className="mt-0.5 shrink-0" />
        <p>
          These details are stored in this browser only; FORTIS doesn&apos;t
          transmit them. Browser data can be lost if site data is cleared or the
          device is lost. Print a copy and store it somewhere appropriate.
        </p>
      </div>
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
  type?: "text" | "tel";
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field-input"
        type={type}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
