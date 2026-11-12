<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Page markup in src/components/pages/* is converted from the Stitch exports; keep classes identical to the export — the Stitch designs are the source of truth.
- Registration/payment data lives in localStorage via src/lib/registration.ts only, so a backend can replace that module later.
