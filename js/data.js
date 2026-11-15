/*
  SAMPLE DATA
  These are placeholder categories and resources so the homepage has
  something to show. Later, the admin dashboard will replace this file
  with real data from the database.
*/
window.HUB_DATA = {
  categories: [
    { id: "ai", name: "AI & Agents", blurb: "Tools, skills, prompts and workflows", icon: "i-chip" },
    { id: "tools", name: "Useful Tools", blurb: "Apps, websites and online utilities", icon: "i-tool" },
    { id: "guides", name: "Guides & PDFs", blurb: "Tutorials and downloadable files", icon: "i-doc" },
    { id: "tech", name: "Technology", blurb: "Phone, Smart TV and software tips", icon: "i-phone" }
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
