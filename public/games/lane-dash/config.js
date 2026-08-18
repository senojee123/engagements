/* ========================================================================
   CONFIG.JS — local configuration, loaded before engine/leaderboard-client.js.

   See config.example.js for what these values mean and where to get them.
   ACTION NEEDED: replace both placeholders below with your actual Supabase
   project's values (dashboard -> Project Settings -> API), or score
   submission stays safely disabled (see the warning leaderboard-client.js
   logs for a still-placeholder config).
======================================================================== */
window.GAME_CONFIG = {
  SUPABASE_URL: 'https://awjaovibrslzghflwwin.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_OPviUM9Hl4QCxv6F3v2nAQ_F9tgHYeg',
  SCORES_TABLE: 'scores',

  // Backend the branding config (logos, colors, billboards) is fetched from
  // on every load — see branding-loader.js. Update this whenever the backend
  // moves; branding-loader.js no longer hardcodes it, so this is the only
  // place that needs to change.
  BACKEND_API: 'https://api.innovativeengagements.online',
};