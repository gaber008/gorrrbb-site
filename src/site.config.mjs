// Site settings. Edit this file to rename the site or change the menu.
export default {
  name: "GORRRBB",
  author: "Gabe Rodriguez",
  url: "https://diewhenever.com", // change to https://gorrrbb.com at launch
  instagram: "https://www.instagram.com/gorrrbb/",
  // Menu order. Each Collection is a folder in src/content.
  // Entries inside a Collection are sorted newest first by `date`,
  // unless `order` is set in an entry's front matter.
  menu: [
    { label: "Yearbooks", folder: "yearbooks" },
    { label: "Adventures", folder: "adventures" },
    { label: "Film", folder: "film" },
    {
      label: "Thoughts",
      folder: "thoughts",
      extra: [{ label: "live slow, die whenever", href: "/thoughts/blog/" }],
      hideTypes: ["post"],
    },
  ],
};
