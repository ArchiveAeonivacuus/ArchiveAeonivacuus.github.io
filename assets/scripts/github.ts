// Enrich `:::github` cards with repository metadata from the GitHub API,
// mirroring the original site's behaviour.
function compact(value: number | undefined): string {
  return new Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 })
    .format(value ?? 0)
    .replace(/\u202f/g, "");
}

type RepoData = {
  description?: string | null;
  language?: string | null;
  forks?: number;
  stargazers_count?: number;
  license?: { spdx_id?: string } | null;
  owner?: { avatar_url?: string };
};

export function mountGithubCards(): void {
  const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>(".card-github[data-repo]"));
  for (const card of cards) {
    if (card.dataset.state === "loading" || card.dataset.state === "loaded") continue;
    const repo = card.dataset.repo;
    if (!repo) continue;
    card.dataset.state = "loading";
    card.classList.add("fetch-waiting");

    fetch(`https://api.github.com/repos/${repo}`, { referrerPolicy: "no-referrer" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: RepoData) => {
        const description = card.querySelector(".gc-description");
        if (description) description.textContent = (data.description ?? "").replace(/:[a-zA-Z0-9_]+:/g, "") || "Description not set";
        const language = card.querySelector(".gc-language");
        if (language) language.textContent = data.language ?? "";
        const stars = card.querySelector(".gc-stars");
        if (stars) stars.textContent = compact(data.stargazers_count);
        const forks = card.querySelector(".gc-forks");
        if (forks) forks.textContent = compact(data.forks);
        const license = card.querySelector(".gc-license");
        if (license) license.textContent = data.license?.spdx_id ?? "no-license";
        const avatar = card.querySelector<HTMLElement>(".gc-avatar");
        if (avatar && data.owner?.avatar_url) {
          avatar.style.backgroundImage = `url('${data.owner.avatar_url}')`;
          avatar.style.backgroundColor = "transparent";
        }
        card.classList.remove("fetch-waiting");
        card.dataset.state = "loaded";
      })
      .catch(() => {
        card.classList.remove("fetch-waiting");
        card.classList.add("fetch-error");
        card.dataset.state = "error";
      });
  }
}
