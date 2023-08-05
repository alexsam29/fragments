# POST JSON Fragment --------------------------------------------------------------------------------

# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
# Body
{ "service": "DynamoDB" }

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
jsonpath "$.fragment.type" == "application/json"
# 25 is the length
jsonpath "$.fragment.size" == 25
# Capture the Location URL
[Captures]
fragment_url: header "Location"
fragment_id: jsonpath "$.fragment.id"

# GET the fragment by URL
GET {{fragment_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
# Various assertions to check
[Asserts]
# Fragment ids use UUIDs
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 25 is the length
jsonpath "$.fragment.size" == 25

# POST Markdown Fragment ----------------------------------------------------------------------------------------------------------

# [BasicAuth] POST Request
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
# Body
`DynamoDB is **great**.`

# Expect to get back a HTTP 201
HTTP/1.1 201

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
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length
jsonpath "$.fragment.size" == 22
# Capture the Location URL
[Captures]
fragment_url2: header "Location"
fragment_id2: jsonpath "$.fragment.id"

# GET the fragment by URL
GET {{fragment_url2}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
# Various assertions to check
[Asserts]
# Fragment ids use UUIDs
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
# 22 is the length
jsonpath "$.fragment.size" == 22


# Get all Fragments ---------------------------------------------------------------------------------------------------

# [BasicAuth] GET Request
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes "{{fragment_id}}"
jsonpath "$.fragments" includes "{{fragment_id2}}"

# DELETE first fragment ---------------------------------------------------------------------------------------------------------

# DELETE the fragment by URL
DELETE {{fragment_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# GET the fragment by URL to confirm deletion
GET {{fragment_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# GET all Fragments again --------------------------------------------------------------------------------------------------------

# [BasicAuth] GET Request
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not includes "{{fragment_id}}"
jsonpath "$.fragments" includes "{{fragment_id2}}"
