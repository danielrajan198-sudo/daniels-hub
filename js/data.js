/*
  SAMPLE DATA
  These are placeholder categories, resources and collections so the site has
  something to show. Later, the admin dashboard will replace this file
  with real data from the database.

  "short" is the one-line description used on the Browse page cards.
  A collection lists resource ids. It only groups resources that already
  exist below, and a resource can sit in its own category and in any number
  of collections. An id that does not exist is simply skipped.
  "accent" picks the colour of a collection card: violet, teal or sunset.
*/
window.HUB_DATA = {
  categories: [
    { id: "ai", name: "AI & Agents", icon: "i-chip",
      short: "Tools, skills and prompts",
      description: "AI tools, agent skills, prompts, tutorials and useful workflows." },
    { id: "tools", name: "Useful Tools", icon: "i-tool",
      short: "Handy apps and websites",
      description: "Useful apps, websites and online utilities." },
    { id: "guides", name: "Guides & PDFs", icon: "i-doc",
      short: "Step-by-step help",
      description: "Practical tutorials, step-by-step guides and downloadable PDFs." },
    { id: "tech", name: "Technology", icon: "i-phone",
      short: "Phone and TV tips",
      description: "Phone and Smart TV guides, software tutorials and technology tips." }
  ],
  collections: [
    { id: "best-ai-websites", name: "Best AI Websites", icon: "i-spark", accent: "violet",
      description: "A collection of useful AI websites and resources.",
      resources: ["r1", "r3", "r6"] },
    { id: "students-digital-toolkit", name: "Student's Digital Toolkit", icon: "i-cap", accent: "teal",
      description: "Useful digital resources for studying and learning.",
      resources: ["r3", "r4", "r7"] },
    { id: "productivity-boost", name: "Productivity Boost", icon: "i-bolt", accent: "sunset",
      description: "Tools that help people work more efficiently.",
      resources: ["r4", "r6", "r7"] }
  ],
  resources: [
    {
      id: "r1", category: "ai", title: "Agent skills starter kit",
      description: "Ready-made skills that teach an AI agent new tasks.",
      tags: ["agents", "skills"], date: "2026-11-14", pdf: false, url: ""
    },
    {
      id: "r2", category: "guides", title: "Android privacy checklist",
      description: "Phone settings to lock down, step by step.",
      tags: ["android", "privacy"], date: "2026-11-12", pdf: true, url: ""
    },
    {
      id: "r3", category: "ai", title: "Research prompt patterns",
      description: "Prompt templates for summaries, comparisons and fact checks.",
      tags: ["prompts", "research"], date: "2026-11-11", pdf: false, url: ""
    },
    {
      id: "r4", category: "tools", title: "Free online OCR tool",
      description: "Turns photos of text into text you can copy.",
      tags: ["ocr", "utility"], date: "2026-11-10", pdf: false, url: ""
    },
    {
      id: "r5", category: "tech", title: "Smart TV first-setup guide",
      description: "Accounts, apps and picture settings for a new TV.",
      tags: ["smart tv", "setup"], date: "2026-11-08", pdf: false, url: ""
    },
    {
      id: "r6", category: "guides", title: "Beginner's guide to AI workflows",
      description: "How to chain a few simple steps into a repeatable routine.",
      tags: ["workflow", "beginner"], date: "2026-11-06", pdf: true, url: ""
    },
    {
      id: "r7", category: "tools", title: "Offline PDF toolkit",
      description: "Merge, split and compress PDFs without uploading them.",
      tags: ["pdf", "offline"], date: "2026-11-04", pdf: false, url: ""
    },
    {
      id: "r8", category: "tech", title: "Speed up an old Android phone",
      description: "Storage, battery and background app fixes that help.",
      tags: ["android", "performance"], date: "2026-11-02", pdf: false, url: ""
    }
  ]
};
