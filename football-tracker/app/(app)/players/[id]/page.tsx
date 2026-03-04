import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <section>
      <Link href="/players" className="text-sm text-zinc-600 hover:underline">
        Back to players
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
        Player Profile
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{data.player.fullName}</h2>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        PRD MVP profile view with overview details, notes history, and awards tags.
      </p>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Overview</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase text-zinc-500">Class</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.dartmouthClass ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Height</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {data.player.heightInches ? `${data.player.heightInches} in` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Weight</dt>
            <dd className="mt-1 text-sm text-zinc-800">
              {data.player.weightLbs ? `${data.player.weightLbs} lbs` : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">State</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.state ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">High School</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.highSchool ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Development Tag</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.developmentTag ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Games Played</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.gamesPlayed ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Games Started</dt>
            <dd className="mt-1 text-sm text-zinc-800">{data.player.gamesStarted ?? "-"}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs uppercase text-zinc-500">Eval</p>
          <p className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap">{data.player.evalText ?? "-"}</p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Notes</h3>
            <span className="text-xs text-zinc-500">{data.notes.length}</span>
          </div>

          {data.notes.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No notes for this player yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {data.notes.map((note) => (
                <article key={note.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-sm whitespace-pre-wrap text-zinc-800">{note.noteText}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDate(note.createdAt)}
                    {note.seasonLabel ? ` | ${note.seasonLabel}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Awards</h3>
            <span className="text-xs text-zinc-500">{data.awards.length}</span>
          </div>

          {data.awards.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">No awards for this player yet.</p>
          ) : (
            <div className="mt-3 grid gap-2">
              {data.awards.map((award) => (
                <article key={award.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    {award.awardTag}
                  </p>
                  <p className="mt-1 text-sm text-zinc-800">{award.awardLabel}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDate(award.createdAt)}
                    {award.seasonLabel ? ` | ${award.seasonLabel}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-800">Next Step</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Add authenticated server actions for note and award creation/editing so each change
          records `created_by`/`updated_by` under RLS.
        </p>
      </section>
    </section>
  );
}
