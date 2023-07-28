# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`Hello S3!`

# Expect to get back a HTTP 201
HTTP/1.1 201

# Various assertions to check
[Asserts]
# Location header (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Fragment ids use UUIDs
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
# 19 is the length
jsonpath "$.fragment.size" == 9
# Capture the Location URL
[Captures]
url: header "Location"

# GET the fragment by URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 9
[Asserts]
body == "Hello S3!"

# DELETE the fragment by URL
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# GET the fragment by URL to confirm deletion
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
