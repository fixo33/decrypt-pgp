const openpgp = require("openpgp");
const fs = require("fs");
const publicKeyArmored = fs.readFileSync("./publicKey.txt", {
  encoding: "utf8",
  flag: "r",
});

(async () => {
  //   const plainData = fs.readFileSync("secret.txt");
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const plainData = "Luke, I am your father";
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: plainData }),
    encryptionKeys: publicKey,
    //  publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys,
  });
  console.log(encrypted);
  fs.writeFileSync("encrypted-secret.txt", encrypted);
  console.log(`data has been encrypted...`);
})();
