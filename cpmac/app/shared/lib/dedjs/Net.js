require("nativescript-websockets");
const Convert = require("./Convert");
const Helper = require("./Helper");
const ObjectType = require("./ObjectType");
const Fetch = require("fetch");
const CothorityMessages = require("./protobuf/build/cothority-messages");

const PASTEBIN_API_DEV_KEY = "7e191c8a4ecbd45a89eaed70ad5cf282";
const PASTEBIN_API_USER_KEY = "8f267e7c0493549910854cafa27f2df1";
const PASTEBIN_URL = "https://pastebin.com/";
const PASTEBIN_URL_PASTE = PASTEBIN_URL + "api/api_post.php?";
const PASTEBIN_URL_GET = PASTEBIN_URL + "raw/";

/**
 * Constructor foa pastebin object. This can be used to upload/download plain text.
 */
function PasteBin() {
  /**
   * Gets the plain text of a paste given its ID.
   * @param {string} id - the id of the paste
   * @returns {Promise} - a promise that gets resolved once the plain text has been downloaded from the paste, the promise contains the plain text
   */
  this.get = (id) => {
    if (typeof id !== "string") {
      throw new Error("id must be of type string");
    }

    return Fetch.fetch(PASTEBIN_URL_GET + id)
      .then(response => {
        return response.text();
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  };

  /**
   * Creates a new paste from the text given as parameter.
   * @param {string} text - the wanted content of the paste
   * @returns {Promise} - a promise that gets resolved once the paste has been created, the promise contains the ID of the new paste
   */
  this.paste = (text) => {
    if (typeof text !== "string") {
      throw new Error("text must be of type string");
    }

    return Fetch.fetch(PASTEBIN_URL_PASTE, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      }),
      body: "api_dev_key=" + PASTEBIN_API_DEV_KEY + "&api_option=paste&api_paste_code=" + text
        + "&api_user_key=" + PASTEBIN_API_USER_KEY + "&api_paste_name=random&api_paste_format=json&api_paste_private=0&api_paste_expire_date=1D"
    })
      .then(response => {
        return response.text();
      })
      .then(url => {
        return url.replace(PASTEBIN_URL, "");
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Promise.reject(error);
      });
  };
}

module.exports.PasteBin = PasteBin;
