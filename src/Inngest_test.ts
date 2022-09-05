import { _internals, Inngest } from "./Inngest.ts";
import {
  assert,
  assertRejects,
  assertSpyCalls,
  resolvesNext,
  stub,
} from "../test_deps.ts";

Deno.test("constructor should initialize without an error", () => {
  const inngest = new Inngest("test-key");
  assert(inngest instanceof Inngest);
});

Deno.test("constructor should accept options", () => {
  const inngestApiUrl = "https://example.com";

  const inngest = new Inngest("test-key", {
    inngestApiUrl,
  });

  assert(inngest["inngestApiUrl"].startsWith(inngestApiUrl));
});

Deno.test("should send an event", async () => {
  const fetchStub = stub(
    _internals,
    "fetch",
    resolvesNext([{ status: 200 } as Response]),
  );

  try {
    const inngest = new Inngest("test-key");
    await inngest.send({
      name: "test-event",
      data: { test: "test" },
    });
  } finally {
    fetchStub.restore();
  }

  assertSpyCalls(fetchStub, 1);
});

Deno.test("should send multiple events", async () => {
  const fetchStub = stub(
    _internals,
    "fetch",
    resolvesNext([{ status: 200 } as Response]),
  );

  try {
    const inngest = new Inngest("test-key");
    await inngest.send([
      {
        name: "test-event",
        data: { test: "one" },
      },
      {
        name: "test-event",
        data: { test: "two" },
      },
    ]);
  } finally {
    fetchStub.restore();
  }

  assertSpyCalls(fetchStub, 1);
});

Deno.test("should throw an error with a non-2xx response", async () => {
  const fetchStub = stub(
    _internals,
    "fetch",
    resolvesNext([{ status: 401 } as Response]),
  );

  try {
    const inngest = new Inngest("test-key");

    await assertRejects(
      () =>
        inngest.send({
          name: "test-event",
          data: { test: "one" },
        }),
      Error,
      "API Key Not Found",
    );
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should return the error message for 406 responses", async () => {
  const customErr = "foo bar baz";

  const fetchStub = stub(
    _internals,
    "fetch",
    resolvesNext([
      { status: 406, text: () => Promise.resolve(customErr) } as Response,
    ]),
  );

  try {
    const inngest = new Inngest("test-key");

    await assertRejects(
      () =>
        inngest.send({
          name: "test-event",
          data: { test: "one" },
        }),
      Error,
      customErr,
    );
  } finally {
    fetchStub.restore();
  }
});
