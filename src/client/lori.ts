import Lori = require("@kyrorblx/lori");

import Log from "shared/log";

// Studio-only by default (Lori's own default) - mirrors every Log.info/Log.debug/
// Log.warn/Log.fatal onto an in-game overlay row so they're visible without
// alt-tabbing to the output window. Client-only: Lori's UI lives in PlayerGui, so
// this module must never be required from server code.
const lori = Lori.create();
lori.mount();

Log.addSink((level, scope, message) => {
  if (level === "warn")
    lori.warn(scope, message);
  else if (level === "fatal")
    lori.error(scope, message);
  else
    lori.trace(scope, message);
});
