/*
  SITE SETTINGS (safe to edit)

  adminTrigger
    Typing this exact phrase into the homepage search bar reveals an
    "Admin Login" link. Capital letters and spaces at the ends are ignored.
    Leave it empty ("") to turn the hidden link off.

    IMPORTANT: this is NOT security. This file is public, so anyone who
    reads the site's code can find the phrase. It only keeps the link out
    of sight for ordinary visitors. The real protection will be Supabase
    sign-in plus database rules (Row Level Security).

    Change this placeholder to your own phrase before publishing.
*/
window.HUB_CONFIG = {
  adminTrigger: "hub-admin-access",
  adminPage: "admin/index.html"
};
