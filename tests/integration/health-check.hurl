# Health Check Test
GET http://localhost:8080

# Receive a HTTP 1.1 200 response
HTTP/1.1 200

# Receive a non-cacheable response (cache-control header)
Cache-Control: no-cache

# Extra checks to perform against the response
[Asserts]
# Expect to get back a JSON response with { "status": "ok", ... }
jsonpath "$.status" == "ok"
# Expect to get back a JSON response with { ..., "author": "..." }
jsonpath "$.author" isString
# Expect to get back a JSON response with { ..., "githubUrl": "..." }
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
# Expect to get back a JSON response with { ..., "version": "x.y.z" }
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
