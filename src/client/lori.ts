import Lori from "@kyrorblx/lori";

import Log from "shared/log";

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
