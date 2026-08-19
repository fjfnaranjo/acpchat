# acpchat testing strategy

Testing is modeled entirely around **stream simulation** rather than
unit tests. _stdin_, _stdout_ and _stderr_ streams are recorded and
session playback files are created from the records.

Integration tests spin up `acpchat` against a mocked ACP agent
(`mock-agent.ts`), inject _stdin_ sessions, and assert against a
reference text, relying in `stdout` / `stdin` redirections.

```sh
tsx src/main.ts bin/mock-agent.ts \
    test/sessions/test-00-stdout \
    test/sessions/test-00-stderr \
    < test/sessions/test-00-stdin \
    > test/sessions/test-00-actual
test diff test/sessions/test-00-actual test/sessions/test-00-expected
```

`src/main.ts` and `test/mock-agent.ts` can interpret special lines to
make the stream wait when needed for time dependant tests.
