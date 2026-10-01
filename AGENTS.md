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

- Seguro and Reglamento are the original uploaded HTML kept verbatim as public/seguro.html and public/reglamento.html; only nav and the confirm script were patched — why: preserve the exact original design.
- Read confirmations are stored in the public confirmaciones table (anon insert/select, no auth by request); /admin reads it client-side.
