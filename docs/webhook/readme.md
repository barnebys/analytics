## Sending events server side

In some cases you would need to send an event server side. As Barnebys Analytics is heavily dependent on a fingerprint
of the users browser there some caveat to sending server side. To simplify that process there is webook that can be
used to make an event server side


### Caveats
- `ba.init` needs to be initialized with a second parameter, the `ref`, commonly the userId is used here.
- An event needs to be sent client side (usually on a bid event) prior to a Webook request for that `ref`  
- Calling the Webhook requires the `ref` to be able to connect the event to a session

## Webhook req/res

See [example.http](example.http) for details on the request

Response will be a JSON 200 on success containing `{status: "ok", affected: [{status, error, programId, ref, source}] }` and a JSON 400 on failure containing `{status: "failed", "error": "an error message}`  