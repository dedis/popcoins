## Modules

<dl>
<dt><a href="#module_crypto">crypto</a></dt>
<dd></dd>
<dt><a href="#module_misc">misc</a></dt>
<dd></dd>
<dt><a href="#module_net">net</a></dt>
<dd></dd>
</dl>

<a name="module_crypto"></a>

## crypto

* [crypto](#module_crypto)
    * [~marshal(point)](#module_crypto..marshal) ⇒ <code>Uint8Array</code>
    * [~unmarshal(bytes)](#module_crypto..unmarshal) ⇒ <code>object</code>
    * [~embed(data)](#module_crypto..embed) ⇒ <code>object</code>
    * [~elgamalEncrypt(key, message)](#module_crypto..elgamalEncrypt) ⇒ <code>object</code>
    * [~elgamalDecrypt(secret, K, C)](#module_crypto..elgamalDecrypt) ⇒ <code>object</code>
    * [~extractDataFromPoint()](#module_crypto..extractDataFromPoint) ⇒ <code>Uint8Array</code>
    * [~generateRandomKeyPair()](#module_crypto..generateRandomKeyPair) ⇒ <code>object</code>
    * [~schnorrSign(secret, message)](#module_crypto..schnorrSign) ⇒ <code>Uint8Array</code>
    * [~schnorrVerify(pub, message, signature)](#module_crypto..schnorrVerify) ⇒ <code>boolean</code>

<a name="module_crypto..marshal"></a>

### crypto~marshal(point) ⇒ <code>Uint8Array</code>
Convert a ed25519 curve point into a byte representation.
[github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L99](github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L99).

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>Uint8Array</code> - byte representation  

| Param | Type | Description |
| --- | --- | --- |
| point | <code>object</code> | elliptic.js curve point |

<a name="module_crypto..unmarshal"></a>

### crypto~unmarshal(bytes) ⇒ <code>object</code>
Convert a Uint8Array back into a ed25510 curve point.
[github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L109](github.com/dedis/kyber/blob/master/group/edwards25519/ge.go#L109).

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>object</code> - elliptic.js curve point  
**Throws**:

- <code>TypeError</code> when bytes is not Uint8Array
- <code>Error</code> when bytes does not correspond to a valid point


| Param | Type |
| --- | --- |
| bytes | <code>Uint8Array</code> | 

<a name="module_crypto..embed"></a>

### crypto~embed(data) ⇒ <code>object</code>
Embed tries to find a valid ed25519 curve point for data of maximal size
29 bytes. Currently no data messages are not supported.
[github.com/dedis/kyber/blob/master/group/edwards25519/point.go#L107](github.com/dedis/kyber/blob/master/group/edwards25519/point.go#L107).

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>object</code> - elliptic.js curve point  
**Throws**:

- <code>TypeError</code> when data is not a Uint8Array
- <code>Error</code> when data size is not between 1 and 29 bytes


| Param | Type | Description |
| --- | --- | --- |
| data | <code>Uint8Array</code> | to be embeded |

<a name="module_crypto..elgamalEncrypt"></a>

### crypto~elgamalEncrypt(key, message) ⇒ <code>object</code>
ElGamal encryption algorithm.
[en.wikipedia.org/wiki/ElGamal_encryption](en.wikipedia.org/wiki/ElGamal_encryption).

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>object</code> - ElGamal elliptic.js keypair  
**Throws**:

- <code>TypeError</code> when message is not a Uint8Array


| Param | Type | Description |
| --- | --- | --- |
| key | <code>object</code> | elliptic.js curve point |
| message | <code>Uint8Array</code> | to be encrypted |

<a name="module_crypto..elgamalDecrypt"></a>

### crypto~elgamalDecrypt(secret, K, C) ⇒ <code>object</code>
ElGamal decryption algorithm.
[en.wikipedia.org/wiki/ElGamal_encryption](en.wikipedia.org/wiki/ElGamal_encryption).

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>object</code> - elliptic.js point  

| Param | Type | Description |
| --- | --- | --- |
| secret | <code>object</code> | bn.js number |
| K | <code>object</code> | first elliptic.js point. |
| C | <code>object</code> | second elliptic.js point. |

<a name="module_crypto..extractDataFromPoint"></a>

### crypto~extractDataFromPoint() ⇒ <code>Uint8Array</code>
Extract embeded bytes from point.

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>Uint8Array</code> - data  

| Param | Type | Description |
| --- | --- | --- |
| elliptic.js | <code>object</code> | point. |

<a name="module_crypto..generateRandomKeyPair"></a>

### crypto~generateRandomKeyPair() ⇒ <code>object</code>
Generate a random ed25519 elliptic.js key pair.

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>object</code> - elliptic.js key pair  
<a name="module_crypto..schnorrSign"></a>

### crypto~schnorrSign(secret, message) ⇒ <code>Uint8Array</code>
Perform a Schnorr signature on a given message.
[https://github.com/dedis/kyber/blob/v0/sign/schnorr.go](https://github.com/dedis/kyber/blob/v0/sign/schnorr.go)

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  
**Returns**: <code>Uint8Array</code> - signature  

| Param | Type | Description |
| --- | --- | --- |
| secret | <code>object</code> | bn.js number |
| message | <code>Uint8Array</code> | to be signed |

<a name="module_crypto..schnorrVerify"></a>

### crypto~schnorrVerify(pub, message, signature) ⇒ <code>boolean</code>
Verfiy a given Schnorr signature.
[https://github.com/dedis/kyber/blob/v0/sign/schnorr.go](https://github.com/dedis/kyber/blob/v0/sign/schnorr.go)

**Kind**: inner method of [<code>crypto</code>](#module_crypto)  

| Param | Type | Description |
| --- | --- | --- |
| pub | <code>object</code> | elliptic.js point |
| message | <code>Uint8Array</code> |  |
| signature | <code>Uint8Array</code> | to be verified |

<a name="module_misc"></a>

## misc

* [misc](#module_misc)
    * [~uint8ArrayToHex(buffer)](#module_misc..uint8ArrayToHex) ⇒ <code>string</code>
    * [~hexToUint8Array(string)](#module_misc..hexToUint8Array) ⇒ <code>Uint8Array</code>
    * [~reverseHex(hex)](#module_misc..reverseHex) ⇒ <code>string</code>

<a name="module_misc..uint8ArrayToHex"></a>

### misc~uint8ArrayToHex(buffer) ⇒ <code>string</code>
Convert a byte buffer to a hexadecimal string.

**Kind**: inner method of [<code>misc</code>](#module_misc)  
**Returns**: <code>string</code> - hexadecimal representation  
**Throws**:

- <code>TypeError</code> when buffer is not Uint8Array


| Param | Type |
| --- | --- |
| buffer | <code>Uint8Array</code> | 

<a name="module_misc..hexToUint8Array"></a>

### misc~hexToUint8Array(string) ⇒ <code>Uint8Array</code>
Convert a hexadecimal string to a Uint8Array.

**Kind**: inner method of [<code>misc</code>](#module_misc)  
**Returns**: <code>Uint8Array</code> - byte buffer  
**Throws**:

- <code>TypeError</code> when hex is not a string


| Param | Type |
| --- | --- |
| string | <code>string</code> | 

<a name="module_misc..reverseHex"></a>

### misc~reverseHex(hex) ⇒ <code>string</code>
Reverse a hexadecimal string.

**Kind**: inner method of [<code>misc</code>](#module_misc)  
**Returns**: <code>string</code> - reversed hex string  
**Throws**:

- <code>TypeError</code> when hex is not a string


| Param | Type |
| --- | --- |
| hex | <code>string</code> | 

<a name="module_net"></a>

## net

* [net](#module_net)
    * [~parseCothorityRoster(toml)](#module_net..parseCothorityRoster) ⇒ <code>object</code>
    * [~convertServerIdentityToWebSocket(object)](#module_net..convertServerIdentityToWebSocket) ⇒ <code>string</code>
    * [~Socket(string, protobuf)](#module_net..Socket)
        * [.send(request, response, data)](#module_net..Socket+send) ⇒ <code>object</code>

<a name="module_net..parseCothorityRoster"></a>

### net~parseCothorityRoster(toml) ⇒ <code>object</code>
Parse cothority roster toml string into a JavaScript object.

**Kind**: inner method of [<code>net</code>](#module_net)  
**Returns**: <code>object</code> - roster  
**Throws**:

- <code>TypeError</code> when toml is not a string


| Param | Type | Description |
| --- | --- | --- |
| toml | <code>string</code> | of the above format. |

**Example**  
```js
// Toml needs to adhere to the following format
// where public has to be a base64 encodable string.

    [[servers]]
        Address = "tcp://127.0.0.1:7002"
        Public = "GhxOf6H+23gK2NP4qu+FrRT5/Ca08+tCRcAaoZu26BY="
        Description = "Conode_1"
    [[servers]]
        Address = "tcp://127.0.0.1:7004"
        Public = "HSSppBPaE4QFpPQ2yvDN9Fss/RIe/jmtEvNvMm3y49M="
        Description = "Conode_2"

Where public has to be a base64 encodable string.
```
<a name="module_net..convertServerIdentityToWebSocket"></a>

### net~convertServerIdentityToWebSocket(object) ⇒ <code>string</code>
Convert a server identity url to a websocket url.

**Kind**: inner method of [<code>net</code>](#module_net)  
**Returns**: <code>string</code> - websocket url  

| Param | Type |
| --- | --- |
| object | <code>serverIdentity</code> | 

<a name="module_net..Socket"></a>

### net~Socket(string, protobuf)
Socket is a WebSocket object instance through which protobuf messages are
sent to conodes.

**Kind**: inner method of [<code>net</code>](#module_net)  
**Throws**:

- <code>TypeError</code> when url is not a string or protobuf is not an object


| Param | Type | Description |
| --- | --- | --- |
| string | <code>url</code> | conode identity |
| protobuf | <code>object</code> | protobufjs model containing registered messages |

<a name="module_net..Socket+send"></a>

#### socket.send(request, response, data) ⇒ <code>object</code>
Send transmits data to a given url and parses the response.

**Kind**: instance method of [<code>Socket</code>](#module_net..Socket)  
**Returns**: <code>object</code> - Promise with response message on success, and an error on failure  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>string</code> | name of registered protobuf message |
| response | <code>string</code> | name of registered protobuf message |
| data | <code>object</code> | to be sent |

