import { RunService } from "@rbxts/services";
import { Logger, OutputStream, timestampTag } from "@rbxts/ez-log";

const logger = new Logger(OutputStream.RobloxConsole, [timestampTag]);
const verbose = RunService.IsStudio();

type LogSinkLevel = "info" | "warn" | "fatal";
type LogSink = (level: LogSinkLevel, scope: string | undefined, message: string) => void;
const sinks: LogSink[] = [];

function notifySinks(level: LogSinkLevel, scope: string | undefined, message: string): void {
  for (const sink of sinks)
    sink(level, scope, message);
}

interface ScopedLogger {
  readonly info: (message: string, tags?: string[]) => void;
  readonly warn: (message: string, tags?: string[]) => void;
  readonly fatal: (message: string, tags?: string[]) => never;
  /** Only prints in Studio - use for noisy diagnostic detail that would spam production logs. */
  readonly debug: (message: string, tags?: string[]) => void;
  /** Like the global `assert`, but routes the failure message through `fatal` instead of Luau's `error` so it's tagged/sinked like every other log. */
  readonly assert: (condition: unknown, message?: string, tags?: string[]) => asserts condition;
}

function withTag(tag: string, tags?: string[]): string[] {
  return tags !== undefined ? [tag, ...tags] : [tag];
}

/**
 * Registers a callback fired alongside every `info`/`debug`/`warn`/`fatal` log (in
 * addition to the normal console output) - e.g. `client/lori.ts` mirrors these onto
 * an in-game debug overlay, with `info`/`debug` surfaced as its lowest-priority
 * "trace" tone since they're diagnostic detail rather than something worth
 * interrupting a playtest for.
 */
function addSink(sink: LogSink): void {
  sinks.push(sink);
}

/**
 * Creates a logger that tags every message with `scope`, so its origin is obvious
 * in the output without repeating a tag array at every call site, e.g.
 * `const log = Log.scoped("quest service")`.
 */
function scoped(scope: string): ScopedLogger {
  const fatal: ScopedLogger["fatal"] = (message, tags) => {
    notifySinks("fatal", scope, message);
    return logger.fatal(message, withTag(scope, tags));
  };

  return {
    info: (message, tags) => {
      notifySinks("info", scope, message);
      logger.info(message, withTag(scope, tags));
    },
    warn: (message, tags) => {
      notifySinks("warn", scope, message);
      logger.warn(message, withTag(scope, tags));
    },
    fatal,
    debug: (message, tags) => {
      if (!verbose) return;
      notifySinks("info", scope, message);
      logger.info(message, withTag("debug", withTag(scope, tags)));
    },
    assert: (condition, message, tags) => {
      if (!condition)
        fatal(message ?? "Assertion failed!", tags);
    }
  };
}

const fatal: ScopedLogger["fatal"] = (message, tags) => {
  notifySinks("fatal", undefined, message);
  return logger.fatal(message, tags);
};

const Log: ScopedLogger & { readonly scoped: typeof scoped; readonly addSink: typeof addSink } = {
  info: (message, tags) => {
    notifySinks("info", undefined, message);
    logger.info(message, tags);
  },
  warn: (message, tags) => {
    notifySinks("warn", undefined, message);
    logger.warn(message, tags);
  },
  fatal,
  debug: (message, tags) => {
    if (!verbose) return;
    notifySinks("info", undefined, message);
    logger.info(message, withTag("debug", tags));
  },
  assert: (condition, message, tags) => {
    if (!condition)
      fatal(message ?? "Assertion failed!", tags);
  },
  scoped,
  addSink
};

export = Log;
