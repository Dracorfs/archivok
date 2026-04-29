import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { prisma } from "~/lib/db";

const loadDraft = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const a = await prisma.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        summary: true,
        contentHtml: true,
      },
    });
    return (
      a ?? { slug, title: "", summary: "", contentHtml: "" }
    );
  });

const saveDraft = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      slug: string;
      title: string;
      summary: string;
      contentHtml: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    await prisma.article.upsert({
      where: { slug: data.slug },
      create: {
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        contentHtml: data.contentHtml,
        published: true,
      },
      update: {
        title: data.title,
        summary: data.summary,
        contentHtml: data.contentHtml,
      },
    });
    return { ok: true };
  });

export const Route = createFileRoute("/edit/$slug")({
  loader: ({ params }) => loadDraft({ data: params.slug }),
  component: EditPage,
});

function EditPage() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary ?? "");
  const [contentHtml, setContentHtml] = useState(initial.contentHtml);
  const [saving, setSaving] = useState(false);

  return (
    <>
      <h1>Editando: {initial.slug}</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await saveDraft({
            data: { slug: initial.slug, title, summary, contentHtml },
          });
          setSaving(false);
          router.navigate({
            to: "/article/$slug",
            params: { slug: initial.slug },
          });
        }}
      >
        <label className="block">
          <span className="text-sm font-semibold">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="block w-full border border-[--color-wiki-border] p-1 bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Resumen</span>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="block w-full border border-[--color-wiki-border] p-1 bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Contenido (HTML)</span>
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            rows={20}
            className="block w-full border border-[--color-wiki-border] p-2 font-mono text-sm bg-white"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="border border-[--color-wiki-border] px-4 py-1 bg-[--color-wiki-sidebar] hover:bg-white disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </>
  );
}
