import { toFileUrl } from "https://deno.land/std@0.154.0/path/mod.ts";
import type { InngestResponse, InngestStep } from "./src/types.d.ts";

async function init(): Promise<InngestResponse> {
  const [fnPath, rawContext] = Deno.args;

  // We pass the event in as an argument to the node function.  Running
  // npx ts-node "./foo.bar" means we have 2 arguments prior to the event.
  // We'll also be adding stdin and lambda compatibility soon.
  const context = JSON.parse(rawContext);

  if (!context) {
    throw new Error("unable to parse context");
  }

  // Import this asynchronously, such that any top-level
  // errors in user code are caught.
  const { run } = (await import(
    new URL(fnPath, toFileUrl(Deno.cwd()).href + "/").href
  )) as {
    run: InngestStep<unknown>;
  };

  const result = await run(context);

  /**
   * We could also validate the response format (status code required) here and
   * throw an error if it's not there?
   */
  return result;
}

if (import.meta.main) {
  init()
    .then((body) => {
      if (typeof body === "string") {
        console.log(JSON.stringify({ body }));
        return;
      }
      console.log(JSON.stringify(body));
    })
    .catch((e: Error) => {
      // TODO: Log error and stack trace.
      console.log(
        JSON.stringify({
          error: e.stack || e.message,
          status: 500,
        }),
      );
      Deno.exit(1);
    });
}
