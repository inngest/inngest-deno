# inngest-deno

👋 _**Have a question or feature request?
[Join our Discord](https://www.inngest.com/discord)!**_

## Usage

```ts
import { Inngest } from "https://deno.land/x/inngest/mod.ts";

const inngest = new Inngest(Deno.env.get("INNGEST_SOURCE_API_KEY"));

// Send a single event
await inngest.send({
  name: "user.signup",
  data: {
    plan: account.planType,
  },
  user: {
    external_id: user.id,
    email: user.email,
  },
});

// Send events in bulk
const events = ["+12125551234", "+13135555678"].map((phoneNumber) => ({
  name: "sms.response.requested",
  data: {
    message: "Are you available for work today? (y/n)",
  },
  user: {
    phone: phoneNumber,
  },
}));

await inngest.send(events);
```
