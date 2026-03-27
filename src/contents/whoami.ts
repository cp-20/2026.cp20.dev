import { ContentsProvider } from ".";
import { image2sixel } from "../features/sixel/image2sixel";
import { ansi } from "../utils/ansi";

const contents = {
  name: "しーぴー🍀",
  description: "世の中にはね、無駄なことなんかひとつだってないのよ、きっと",
  links: [
    { name: "Twitter", url: "https://twitter.com/__cp20__" },
    { name: "mixi2", url: "https://mixi.social/@cp20" },
    { name: "GitHub", url: "https://github.com/cp-20" },
    { name: "Zenn", url: "https://zenn.dev/cp20" },
    { name: "Qiita", url: "https://qiita.com/cp20" },
  ],
  affiliations: [
    {
      name: "東京科学大学 情報工学系 学士4年",
      url: "https://www.isct.ac.jp",
      sub: [{ name: "権藤研", url: "https://gondowlab.jimdofree.com" }],
    },
    {
      name: "デジタル創作同好会traP",
      url: "https://trap.jp",
    },
    {
      name: "CA Tech Lounge",
      url: "https://www.cyberagent.co.jp/careers/special/students/tech_lounge",
    },
  ],
};

export const WhoamiProvider: ContentsProvider = async ({
  raw,
  noImage,
  assets,
  requestUrl,
}) => {
  if (raw) {
    return JSON.stringify(contents);
  }

  const links = contents.links
    .map((link) => `${ansi.blue(link.name)}: ${link.url}`)
    .join("\n");

  const affiliations = contents.affiliations
    .map(
      (aff) =>
        `${ansi.blue(aff.name)} (${aff.url})${
          aff.sub
            ? "\n" +
              aff.sub
                .map((s) => `- ${ansi.blue(s.name)} (${s.url})`)
                .join("\n")
            : ""
        }`,
    )
    .join("\n");

  const output = [
    `${ansi.bold(contents.name)}  ${ansi.dim(contents.description)}`,
    "",
    ansi.bold(ansi.yellow("[Links]")),
    links,
    "",
    ansi.bold(ansi.yellow("[Affiliations]")),
    affiliations,
  ].join("\n");

  const footer = [
    ansi.yellow("See also:"),
    `  https://cp20.dev/articles`,
    `  https://cp20.dev/works`,
    `  https://cp20.dev/featured-series`,
    `  https://cp20.dev/featured-tracks`,
  ].join("\n");

  if (noImage) {
    return `${output}\n\n${footer}`;
  }

  const iconUrl = new URL("/icon.png", requestUrl);
  const request = new Request(iconUrl.toString());
  const response = assets ? await assets.fetch(request) : await fetch(request);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch icon: ${response.status} ${response.statusText}`,
    );
  }
  const iconBuffer = await response.arrayBuffer();
  const image = await image2sixel(iconBuffer);
  const credit = `icon by ${
    ansi.blue("@sora_douhu (https://twitter.com/sora_douhu)")
  }`;
  return `${output}\n\n${image}\n${credit}\n\n${footer}`;
};
