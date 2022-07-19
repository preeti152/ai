module.exports = {
  title: "AI for ALL",
  tagline: "Welcome to UHG's artificial intelligence community!",
  url: "https://ai.uhg.com",
  baseUrl: "/",
  favicon: "img/ai-for-all-icon-unbound.png",
  organizationName: "ai-community",
  projectName: "ai-community-site",
  githubHost: "github.optum.com",
  onBrokenLinks: 'ignore',
  themeConfig: {
    navbar: {
      title: "",
      logo: {
        alt: "AI Community Logo",
        src: "img/ai-for-all-logo.png",
        srcDark: 'img/ai-for-all-logo-dark.png',
      },
      items: [
        {
          to: "docs/about/about-index",
          activeBasePath: "docs/about",
          label: "About",
          position: "left",
        },
        {
          to: "docs/community/community-guidelines",
          activeBasePath: "docs/community",
          label: "Community",
          position: "left",
        },
        {
          to: "docs/events/2022-events",
          activeBasePath: "docs/events",
          label: "Events",
          position: "left",
        },
        {
          to: "docs/learning/training-paths",
          activeBasePath: "docs/learning",
          label: "Learning",
          position: "left",
        },
        {
          to: "docs/standards/platforms",
          activeBasePath: "docs/standards",
          label: "Hands-on AI",
          position: "left",
        },
        {
          label: "Blog",
          activeBasePath: "blog",
          position: "left", // or 'right'
          items: [
            {
              label: "All",
              to: "blog",
              activeBaseRegex: "blog/(!tags)", // basically makes this never active
            },
            {
              label: "Ambient",
              to: "blog/tags/ambient",
            },
            {
              label: "Community",
              to: "blog/tags/community",
            },
            {
              label: "Deep Learning",
              to: "blog/tags/deep-learning",
            },
            {
              label: "Ethical AI",
              to: "blog/tags/ethical-ai",
            },

            {
              label: "ML Engineering",
              to: "blog/tags/ml-engineering",
            },
            {
              label: "NLP",
              to: "blog/tags/nlp",
            },
            {
              label: "Synthetic Data",
              to: "blog/tags/synthetic-data",
            },
            // ... other important categories
          ],
        },
        {
          href: "https://web.yammer.com/main/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiI0ODczNjAwMjA0OCJ9/all",
          position: "right",
          className: "header-yammer-link",
          "aria-label": "Microsoft Yammer",
        },
        {
          href: "https://teams.microsoft.com/l/channel/19%3acaa60c3a0b83449b891732b0ad5ae22b%40thread.tacv2/General?groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421",
          position: "right",
          className: "header-teams-link",
          "aria-label": "Microsoft teams",
        },
        {
          href: "https://github.optum.com/ai-community/ai-community-site",
          position: "right",
          className: "header-github-link",
          "aria-label": "GitHub repository",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Events",
          items: [
            {
              label: "Calendar",
              to: "docs/events/2022-events",
            },
            {
              label: "Promote an Event",
              to:
                "https://github.optum.com/ai-community/ai-community-site/issues/new?assignees=nshofner&labels=event&template=publish-an-event.md&title=",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "Publish a Blog Post",
              href:
                "https://github.optum.com/ai-community/ai-community-site/issues/new?assignees=nshofner&labels=blog-post&template=new-blog-post.md&title=",
            },
            {
              label: "GitHub",
              href: "https://github.optum.com/ai-community/ai-community-site",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Microsoft Teams Channel",
              href:
                "https://teams.microsoft.com/l/team/19%3acaa60c3a0b83449b891732b0ad5ae22b%40thread.tacv2/conversations?groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421",
            },
            {
              label: "Yammer Community",
              href:
                "https://web.yammer.com/main/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiI0ODczNjAwMjA0OCJ9/all",
            },
          ],
        },
      ],
        logo: {
        alt: 'AI for ALL Logo',
        src: "img/ai-for-all-logo-text-mono.png",
        srcDark: 'img/ai-for-all-logo-text-dark.png',
        href: 'https://ai.uhg.com',
      },
      copyright: `© ${new Date().getFullYear()} UnitedHealth Group. All rights reserved.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.optum.com/ai-community/ai-community-site/edit/master/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        blog: {},
      },
    ],
  ],
  plugins: [
    require.resolve('docusaurus-lunr-search'),
  ],
  scripts: ["https://ai.uhg.com/js/matomo.js"],
};
