/**
 * An HTTP-like, standardised response format that allows Inngest to help
 * orchestrate steps and retries.
 */
export interface InngestResponse {
  /**
   * A step response must contain an HTTP status code.
   *
   * A `2xx` response indicates success; this is not a failure and no retry is
   * necessary.
   *
   * A `4xx` response indicates a bad request; this step will not be retried as
   * it is deemed irrecoverable. Examples of this might be an event with
   * insufficient data or concerning a user that no longer exists.
   *
   * A `5xx` status indicates a temporary internal error; this will be retried
   * according to the step and function's retry policy (3 times, by default).
   *
   * @link https://www.inngest.com/docs/functions/function-input-and-output#response-format
   * @link https://www.inngest.com/docs/functions/retries
   */
  status: number;

  /**
   * The output of the function - the `body` - can be any arbitrary
   * JSON-compatible data. It is then usable by any future steps.
   *
   * @link https://www.inngest.com/docs/functions/function-input-and-output#response-format
   */
  body?: unknown;
}

/**
 * A single step within a function.
 */
export type InngestStep<Context = unknown> = (
  /**
   * The context for this step, including the triggering event and any previous
   * step output.
   */
  context: Context,
) => Promise<InngestResponse> | InngestResponse;

/**
 * The event payload structure for sending data to Inngest
 */
export interface EventPayload {
  /**
   * A unique identifier for the event
   */
  name: string;
  /**
   * Any data pertinent to the event
   */
  data: {
    [key: string]: unknown;
  };
  /**
   * Any user data associated with the event
   * All fields ending in "_id" will be used to attribute the event to a particular user
   */
  user?: {
    /**
     * Your user's unique id in your system
     */
    external_id?: string;
    /**
     * Your user's email address
     */
    email?: string;
    /**
     * Your user's phone number
     */
    phone?: string;
    [key: string]: unknown;
  };
  /**
   * A specific event schema version
   * (optional)
   */
  v?: string;
  /**
   * An integer representing the milliseconds since the unix epoch at which this event occurred.
   * Defaults to the current time.
   * (optional)
   */
  ts?: number;
}
