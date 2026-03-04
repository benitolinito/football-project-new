import { signInAction } from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;

type LoginPageProps = {
  searchParams?: Promise<SearchParams>;
};

function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = getParam(params, "error");
  const nextPath = getParam(params, "next") ?? "/dashboard";

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Dartmouth Football
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Staff Login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in with your authorized account to access roster and personnel workflows.
        </p>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <form action={signInAction} className="mt-5 grid gap-3">
          <input type="hidden" name="next" value={nextPath} />

          <label className="grid gap-1 text-sm">
            <span className="text-xs uppercase text-zinc-500">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
              placeholder="coach@dartmouth.edu"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs uppercase text-zinc-500">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
              placeholder="Enter password"
            />
          </label>

          <button
            type="submit"
            className="mt-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign In
          </button>
        </form>
      </main>
    </div>
  );
}
