const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const TomlParser = require("toml");
const Tomlify = require('tomlify-j0.4');

const Convert = require("../shared/lib/dedjs/Convert");

const BYTE_ARRAY = new Uint8Array([243, 39, 52, 77, 162, 48, 121, 100, 114, 48]);
const HEX_STRING = "f327344da23079647230";
const BASE64_STRING = "8yc0TaIweWRyMA==";

const BASE_OBJECT = {};
const SIMPLE_OBJECT = {
  a: "a",
  b: "b"
};
const COMPLEX_OBJECT = {
  a: {
    a: [1, "a", 2, "b"],
    b: {
      c: 3
    }
  },
  b: {
    a: {
      c: 4
    },
    b: [2, "b", 1, "a"]
  }
};

describe("Convert", function () {
  describe("#byteArrayToHex", function () {
    it("should throw an error when the input is not a byte array", function () {
      Convert.byteArrayToHex("BYTE_ARRAY").should.Throw();
    });

    it("should correctly convert a byte array into its hexadecimal representation", function () {
      const actualHexString = Convert.byteArrayToHex(BYTE_ARRAY);

      actualHexString.should.equal(HEX_STRING);
    });
  });

  describe("#hexToByteArray", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.hexToByteArray(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a hexadecimal string into its byte array representation", function () {
      const actualByteArray = Convert.hexToByteArray(HEX_STRING);

      actualByteArray.should.deep.equal(BYTE_ARRAY);
    });
  });

  describe("#byteArrayToBase64", function () {
    it("should throw an error when the input is not a byte array", function () {
      Convert.byteArrayToBase64("BYTE_ARRAY").should.Throw();
    });

    it("should correctly convert a byte array into its base64 representation", function () {
      const actualBase64String = Convert.byteArrayToBase64(BYTE_ARRAY);

      actualBase64String.should.equal(BASE64_STRING);
    });
  });

  describe("#base64ToByteArray", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.base64ToByteArray(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a base64 string into its byte array representation", function () {
      const actualByteArray = Convert.base64ToByteArray(BASE64_STRING);

      actualByteArray.should.deep.equal(BYTE_ARRAY);
    });
  });

  describe("#hexToBase64", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.hexToBase64(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a hex string into its base64 representation", function () {
      const actualBase64String = Convert.hexToBase64(HEX_STRING);

      actualBase64String.should.equal(BASE64_STRING);
    });
  });

  describe("#base64ToHex", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.base64ToHex(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a base64 string into its hex representation", function () {
      const actualHexString = Convert.base64ToHex(BASE64_STRING);

      actualHexString.should.equal(HEX_STRING);
    });
  });

  describe("#objectToJson", function () {
    it("should throw an error when the input is undefined", function () {
      Convert.objectToJson(undefined).should.Throw();
    });

    it("should throw an error when the input is not an object", function () {
      Convert.objectToJson(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert an object into its JSON representation", function () {
      // Base object.
      let actualJsonString = Convert.objectToJson(BASE_OBJECT);
      JSON.parse(actualJsonString).should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualJsonString = Convert.objectToJson(SIMPLE_OBJECT);
      JSON.parse(actualJsonString).should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualJsonString = Convert.objectToJson(COMPLEX_OBJECT);
      JSON.parse(actualJsonString).should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#jsonToObject", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.jsonToObject(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a JSON string into its object representation", function () {
      // Base object.
      let actualObject = Convert.jsonToObject(JSON.stringify(BASE_OBJECT));
      actualObject.should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualObject = Convert.jsonToObject(JSON.stringify(SIMPLE_OBJECT));
      actualObject.should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualObject = Convert.jsonToObject(JSON.stringify(COMPLEX_OBJECT));
      actualObject.should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#objectToToml", function () {
    it("should throw an error when the input is undefined", function () {
      Convert.objectToToml(undefined).should.Throw();
    });

    it("should throw an error when the input is not an object", function () {
      Convert.objectToToml(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert an object into its TOML representation", function () {
      // Base object.
      let actualTomlString = Convert.objectToToml(BASE_OBJECT);
      TomlParser.parse(actualTomlString).should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualTomlString = Convert.objectToToml(SIMPLE_OBJECT);
      TomlParser.parse(actualTomlString).should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualTomlString = Convert.objectToToml(COMPLEX_OBJECT);
      TomlParser.parse(actualTomlString).should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#tomlToObject", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.tomlToObject(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert an object into its TOML representation", function () {
      // Base object.
      let actualObject = Convert.tomlToObject(Tomlify.toToml(BASE_OBJECT));
      actualObject.should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualObject = Convert.tomlToObject(Tomlify.toToml(SIMPLE_OBJECT));
      actualObject.should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualObject = Convert.tomlToObject(Tomlify.toToml(COMPLEX_OBJECT));
      actualObject.should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#jsonToToml", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.jsonToToml(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a JSON string into its TOML representation", function () {
      // Base object.
      let actualObject = TomlParser.parse(Convert.jsonToToml(JSON.stringify(BASE_OBJECT)));
      actualObject.should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualObject = TomlParser.parse(Convert.jsonToToml(JSON.stringify(SIMPLE_OBJECT)));
      actualObject.should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualObject = TomlParser.parse(Convert.jsonToToml(JSON.stringify(COMPLEX_OBJECT)));
      actualObject.should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#tomlToJson", function () {
    it("should throw an error when the input is not a string", function () {
      Convert.tomlToJson(BYTE_ARRAY).should.Throw();
    });

    it("should correctly convert a TOML string into its JSON representation", function () {
      // Base object.
      let actualObject = JSON.parse(Convert.tomlToJson(Tomlify.toToml(BASE_OBJECT)));
      actualObject.should.deep.equal(BASE_OBJECT);

      // Simple object.
      actualObject = JSON.parse(Convert.tomlToJson(Tomlify.toToml(SIMPLE_OBJECT)));
      actualObject.should.deep.equal(SIMPLE_OBJECT);

      // Complex object.
      actualObject = JSON.parse(Convert.tomlToJson(Tomlify.toToml(COMPLEX_OBJECT)));
      actualObject.should.deep.equal(COMPLEX_OBJECT);
    });
  });

  describe("#tcpToWebsocket", function () {
    it("should be tested", function () {
      true.should.be.true;
    });
  });
});
