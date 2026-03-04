import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createAwardAction,
  createNoteAction,
  updateAwardAction,
  updateNoteAction,
} from "./actions";
import { getPlayerProfileData } from "@/lib/queries/players";

type PlayerProfilePageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;
  const data = await getPlayerProfileData(id);

  if (data.errorMessage) {
    return (
      <section>
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {data.errorMessage}
        </p>
      </section>
    );
  }

  if (!data.player) {
    notFound();
  }
  const player = data.player;

  return (
    <section>
      <Link href="/players" className="text-sm text-zinc-600 hover:underline">
        Back to players
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Player Profile
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{player.fullName}</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        PRD MVP profile view with overview details, notes history, and awards tags.
      </p>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Overview</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase text-zinc-500">Class</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.dartmouthClass ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Height</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {player.heightInches ? `${player.heightInches} in` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Weight</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {player.weightLbs ? `${player.weightLbs} lbs` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">State</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.state ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">High School</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.highSchool ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Development Tag</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.developmentTag ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Games Played</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.gamesPlayed ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Games Started</dt>
            <dd className="mt-1 text-sm text-zinc-800">{player.gamesStarted ?? "-"}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs uppercase text-zinc-500">Eval</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{player.evalText ?? "-"}</p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Notes</h3>
            <span className="text-xs text-zinc-500">{data.notes.length}</span>
          </div>

          <form action={createNoteAction} className="mt-3 grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <input type="hidden" name="playerId" value={player.id} />
            <label className="text-xs uppercase text-zinc-500" htmlFor="new-note-season">
              Season
            </label>
            <select
              id="new-note-season"
              name="seasonId"
              defaultValue=""
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Not season-specific</option>
              {data.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
            <label className="text-xs uppercase text-zinc-500" htmlFor="new-note-text">
              Add Note
            </label>
            <textarea
              id="new-note-text"
              name="noteText"
              required
              rows={3}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              placeholder="Enter note"
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Save Note
            </button>
          </form>

          {data.notes.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No notes for this player yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {data.notes.map((note) => (
                <form
                  key={note.id}
                  action={updateNoteAction}
                  className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                >
                  <input type="hidden" name="playerId" value={player.id} />
                  <input type="hidden" name="noteId" value={note.id} />
                  <label className="text-xs uppercase text-zinc-500">Season</label>
                  <select
                    name="seasonId"
                    defaultValue={note.seasonId ?? ""}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="">Not season-specific</option>
                    {data.seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="noteText"
                    required
                    rows={3}
                    defaultValue={note.noteText}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">{formatDate(note.createdAt)}</p>
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Update Note
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Awards</h3>
            <span className="text-xs text-zinc-500">{data.awards.length}</span>
          </div>

          <form action={createAwardAction} className="mt-3 grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <input type="hidden" name="playerId" value={player.id} />
            <label className="text-xs uppercase text-zinc-500" htmlFor="new-award-season">
              Season
            </label>
            <select
              id="new-award-season"
              name="seasonId"
              defaultValue=""
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Not season-specific</option>
              {data.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.label}
                </option>
              ))}
            </select>
            <label className="text-xs uppercase text-zinc-500" htmlFor="new-award-tag">
              Award Tag
            </label>
            <input
              id="new-award-tag"
              name="awardTag"
              required
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              placeholder="e.g. all_ivy"
            />
            <label className="text-xs uppercase text-zinc-500" htmlFor="new-award-label">
              Award Label
            </label>
            <input
              id="new-award-label"
              name="awardLabel"
              required
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
              placeholder="e.g. First Team All-Ivy"
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Save Award
            </button>
          </form>

          {data.awards.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No awards for this player yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {data.awards.map((award) => (
                <form
                  key={award.id}
                  action={updateAwardAction}
                  className="grid gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
                >
                  <input type="hidden" name="playerId" value={player.id} />
                  <input type="hidden" name="awardId" value={award.id} />
                  <label className="text-xs uppercase text-zinc-500">Season</label>
                  <select
                    name="seasonId"
                    defaultValue={award.seasonId ?? ""}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                  >
                    <option value="">Not season-specific</option>
                    {data.seasons.map((season) => (
                      <option key={season.id} value={season.id}>
                        {season.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="awardTag"
                    required
                    defaultValue={award.awardTag}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                  />
                  <input
                    name="awardLabel"
                    required
                    defaultValue={award.awardLabel}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">{formatDate(award.createdAt)}</p>
                    <button
                      type="submit"
                      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      Update Award
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Note</h3>
        <p className="mt-2 text-sm text-zinc-600">
          During local dev mode, writes require DB policies that allow your session role.
          Once Supabase Auth is fully connected, `created_by` and `updated_by` are recorded
          with authenticated user IDs.
        </p>
      </section>
    </section>
  );
}
