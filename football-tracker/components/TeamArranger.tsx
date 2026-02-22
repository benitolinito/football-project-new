"use client";

import { useState } from "react";

export type PlayerOption = {
  id: string;
  label: string;
  position: string | null;
  jerseyNumber: string | null;
};

type Slot = {
  id: string;
  label: string;
  top: string;
  left: string;
};

const OFFENSE_11_PERSONNEL: Slot[] = [
  { id: "xwr", label: "WR", top: "15%", left: "15%" },
  { id: "lt", label: "LT", top: "48%", left: "26%" },
  { id: "lg", label: "LG", top: "48%", left: "36%" },
  { id: "c", label: "C", top: "48%", left: "46%" },
  { id: "rg", label: "RG", top: "48%", left: "56%" },
  { id: "rt", label: "RT", top: "48%", left: "66%" },
  { id: "te", label: "TE", top: "48%", left: "78%" },
  { id: "qb", label: "QB", top: "62%", left: "48%" },
  { id: "rb", label: "RB", top: "78%", left: "48%" },
  { id: "slot", label: "WR", top: "28%", left: "75%" },
  { id: "zwr", label: "WR", top: "15%", left: "88%" },
];

function createEmptyLineup() {
  return Object.fromEntries(
    OFFENSE_11_PERSONNEL.map((slot) => [slot.id, ""])
  ) as Record<string, string>;
}

function getPositionCodes(position: string | null): Set<string> {
  const codes = new Set<string>();
  if (!position) return codes;

  const upper = position.toUpperCase();

  if (upper.includes("QUARTERBACK")) codes.add("QB");
  if (upper.includes("RUNNING BACK")) codes.add("RB");
  if (upper.includes("HALFBACK")) codes.add("HB");
  if (upper.includes("FULLBACK")) codes.add("FB");
  if (upper.includes("WIDE RECEIVER")) codes.add("WR");
  if (upper.includes("TIGHT END")) codes.add("TE");
  if (upper.includes("LEFT TACKLE")) codes.add("LT");
  if (upper.includes("RIGHT TACKLE")) codes.add("RT");
  if (upper.includes("LEFT GUARD")) codes.add("LG");
  if (upper.includes("RIGHT GUARD")) codes.add("RG");
  if (upper.includes("CENTER")) codes.add("C");
  if (upper.includes("OFFENSIVE LINE")) codes.add("OL");
  if (upper.includes("OFFENSIVE TACKLE")) codes.add("OT");
  if (upper.includes("OFFENSIVE GUARD")) codes.add("OG");

  const tokens = upper.split(/[^A-Z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    if (
      [
        "QB",
        "RB",
        "HB",
        "FB",
        "WR",
        "TE",
        "LT",
        "LG",
        "C",
        "RG",
        "RT",
        "OT",
        "OG",
        "OL",
        "T",
        "G",
      ].includes(token)
    ) {
      codes.add(token);
    }
  }

  return codes;
}

function matchesSlotPosition(slotLabel: string, playerPosition: string | null): boolean {
  const codes = getPositionCodes(playerPosition);
  if (codes.size === 0) return false;

  const expectedCodesBySlot: Record<string, string[]> = {
    QB: ["QB"],
    RB: ["RB", "HB", "FB"],
    WR: ["WR"],
    TE: ["TE"],
    LT: ["LT", "T", "OT", "OL"],
    RT: ["RT", "T", "OT", "OL"],
    LG: ["LG", "G", "OG", "OL"],
    RG: ["RG", "G", "OG", "OL"],
    C: ["C", "OL"],
  };

  const expected = expectedCodesBySlot[slotLabel] ?? [];
  return expected.some((code) => codes.has(code));
}

export default function TeamArranger({ players }: { players: PlayerOption[] }) {
  const [teamName, setTeamName] = useState("My Offense");
  const [lineup, setLineup] = useState<Record<string, string>>(createEmptyLineup);
  const selectedPlayerIds = new Set(Object.values(lineup).filter(Boolean));
  const hasPositionData = players.some((player) => player.position);
  const filledSlots = Object.values(lineup).filter(Boolean).length;
  const playerById = new Map(players.map((player) => [player.id, player]));

  function updatePlayer(slotId: string, playerId: string) {
    setLineup((current) => ({ ...current, [slotId]: playerId }));
  }

  function resetLineup() {
    setLineup(createEmptyLineup());
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      <div className="border-b border-zinc-200 bg-gradient-to-r from-white via-zinc-50 to-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700">
              Offense Builder
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              American Football
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              11-personnel layout with position-filtered dropdowns. Pick your lineup and
              build it directly on the field.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] xl:min-w-[26rem]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
              <label
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-600"
                htmlFor="team-name"
              >
                Team Name
              </label>
              <input
                id="team-name"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-0 transition focus:border-emerald-500"
                placeholder="Enter offense name"
              />
            </div>

            <div className="flex gap-2 sm:flex-col">
              <button
                type="button"
                onClick={resetLineup}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50"
              >
                Clear Lineup
              </button>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {filledSlots}/11 selected
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600">
            {players.length > 0
              ? `${players.length} players loaded`
              : "No players loaded"}
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600">
            Position filtering {hasPositionData ? "ON" : "OFF"}
          </span>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600">
            Formation: 11 Personnel
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 xl:grid-cols-[minmax(0,1.7fr)_20rem]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700">
              {teamName || "Unnamed Team"}
            </p>
            <p className="text-xs text-zinc-500">Line of scrimmage centered</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[860px] xl:min-w-0">
              <div className="relative aspect-[21/10] w-full overflow-hidden rounded-3xl border border-emerald-300/20 bg-[radial-gradient(circle_at_50%_10%,rgba(34,197,94,0.35),transparent_55%),linear-gradient(180deg,#157347_0%,#11643e_48%,#0f5b39_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-20px_40px_rgba(0,0,0,0.18)]">
                <div className="absolute inset-4 rounded-2xl border-2 border-white/70" />
                <div className="absolute inset-y-4 left-[8%] border-l border-white/35" />
                <div className="absolute inset-y-4 left-[16%] border-l border-white/25" />
                <div className="absolute inset-y-4 left-[24%] border-l border-white/35" />
                <div className="absolute inset-y-4 left-[32%] border-l border-white/25" />
                <div className="absolute inset-y-4 left-[40%] border-l border-white/35" />
                <div className="absolute inset-y-4 left-1/2 border-l-4 border-white/85" />
                <div className="absolute inset-y-4 left-[60%] border-l border-white/35" />
                <div className="absolute inset-y-4 left-[68%] border-l border-white/25" />
                <div className="absolute inset-y-4 left-[76%] border-l border-white/35" />
                <div className="absolute inset-y-4 left-[84%] border-l border-white/25" />
                <div className="absolute inset-y-4 left-[92%] border-l border-white/35" />

                <div className="absolute inset-x-4 top-[24%] border-t border-dashed border-white/35" />
                <div className="absolute inset-x-4 top-[48%] border-t-4 border-white/95" />
                <div className="absolute inset-x-4 top-[72%] border-t border-dashed border-white/35" />

                {OFFENSE_11_PERSONNEL.map((slot) => {
                  const assignedId = lineup[slot.id];
                  const assignedPlayer = assignedId ? playerById.get(assignedId) : null;
                  const filteredPlayers = hasPositionData
                    ? players.filter((player) => {
                      if (lineup[slot.id] === player.id) return true;
                        return matchesSlotPosition(slot.label, player.position);
                      })
                    : players;

                  return (
                    <div
                      key={slot.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top: slot.top, left: slot.left }}
                    >
                      <div className="w-[clamp(6rem,9vw,8.5rem)] rounded-xl border border-white/30 bg-white/92 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur">
                        <div className="mb-1 flex items-center justify-center gap-1">
                          <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
                            {slot.label}
                          </span>
                          {assignedPlayer?.jerseyNumber ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700">
                              #{assignedPlayer.jerseyNumber}
                            </span>
                          ) : null}
                        </div>
                        <select
                          value={lineup[slot.id] ?? ""}
                          onChange={(event) => updatePlayer(slot.id, event.target.value)}
                          aria-label={`${slot.label} player`}
                          className="w-full rounded-md border border-zinc-300 bg-white px-1.5 py-1 text-[11px] text-zinc-900 outline-none focus:border-emerald-600"
                        >
                          <option value="">
                            {hasPositionData ? "Select" : "Select (all)"}
                          </option>
                          {filteredPlayers.map((player) => {
                            const selectedHere = lineup[slot.id] === player.id;
                            const usedElsewhere =
                              !selectedHere && selectedPlayerIds.has(player.id);

                            return (
                              <option
                                key={player.id}
                                value={player.id}
                                disabled={usedElsewhere}
                              >
                                {player.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">
            Lineup Summary
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Quick view of assigned players by slot.
          </p>

          <div className="mt-4 grid gap-2">
            {OFFENSE_11_PERSONNEL.map((slot) => {
              const assignedId = lineup[slot.id];
              const assignedPlayer = assignedId ? playerById.get(assignedId) : null;

              return (
                <div
                  key={`summary-${slot.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-zinc-900 px-2 py-1 text-xs font-semibold text-white">
                      {slot.label}
                    </span>
                    {assignedPlayer?.jerseyNumber ? (
                      <span className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        #{assignedPlayer.jerseyNumber}
                      </span>
                    ) : null}
                  </div>
                  <span className="truncate text-right text-xs text-zinc-700">
                    {assignedPlayer?.label ?? "Unassigned"}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
